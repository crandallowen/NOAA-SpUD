import { join, basename, extname, dirname } from 'path';
import express, { json, urlencoded, text } from 'express';
import session from 'express-session';
import { readFileSync } from 'fs';
import pg from 'pg';
import format, { withArray } from 'pg-format';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import passport from 'passport';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import passportLocal from 'passport-local';
import { fileURLToPath } from 'url';
import connectPgSimple from 'connect-pg-simple';
import '@dotenvx/dotenvx/config';
import { spawn } from 'node:child_process';
const localStrategy = passportLocal.Strategy;
const pgSession = connectPgSimple(session);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT;
const FILE_EXT = ['.css', '.html', '.js', '.QRY'];
const DB = process.env.DB;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_READ_USER = process.env.DB_READ_USER;
const DB_READ_USER_PASSWORD = process.env.DB_READ_USER_PASSWORD;
const DB_SESSION_USER = process.env.DB_SESSION_USER;
const DB_SESSION_USER_PASSWORD = process.env.DB_SESSION_USER_PASSWORD;
const SECRET_NAME = process.env.SECRET_NAME;
const OPTION_QUERIES = {
    'bureau': `SELECT DISTINCT bureau FROM RFAs ORDER BY bureau ASC`,
    'tx_state_country_code': `SELECT DISTINCT tx_state_country_code FROM RFAs ORDER BY tx_state_country_code ASC`,
    'rx_state_country_code': `SELECT DISTINCT unnest(rx_state_country_code) AS rx_state_country_code FROM RFAs ORDER BY rx_state_country_code ASC`,
    'tx_antenna_location': `SELECT DISTINCT tx_antenna_location FROM RFAs ORDER BY tx_antenna_location ASC`,
    'rx_antenna_location': `SELECT DISTINCT unnest(rx_antenna_location) AS rx_antenna_location FROM RFAs ORDER BY rx_antenna_location ASC`,
    'station_class': `SELECT DISTINCT unnest(station_class) AS station_class FROM RFAs ORDER BY station_class ASC`,
    'function_identifier': `SELECT DISTINCT function_identifier FROM (SELECT main_function_id AS function_identifier FROM RFAs UNION SELECT intermediate_function_id AS function_identifier FROM RFAs UNION SELECT detailed_function_id AS function_identifier FROM RFAs) AS function_identifiers ORDER BY function_identifier ASC`, 
    'point_of_contact': `SELECT DISTINCT point_of_contact FROM RFAs`,
};
const ROW_FILTERS = ['bureau', 'function_identifier', 'tx_state_country_code'];
const SAML_OPTIONS = {
    issuer: 'https://rfmd-spud.woc.noaa.gov',
    callbackUrl: 'https://rfmd-spud.woc.noaa.gov/login/callback',
    logoutCallbackURL: 'https://rfmd-spud.woc.noaa.gov/logout',
    entryPoint: 'https://sso.noaa.gov:443/openam/SSORedirect/metaAlias/cac/idp',
    idpCert: readFileSync(join(__dirname, 'idp_cert.pem'), 'latin1'),
    privateKey: readFileSync(join(__dirname, 'private-key.key'), 'latin1'),
    publicCert: readFileSync(join(__dirname, 'sp_cert.pem'), 'latin1'),
    signatureAlgorithm: 'sha256',
    passReqToCallback: true,
    signMetadata: true,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    disableRequestedAuthnContext: true,
};
const SAML_STRATEGY = new SamlStrategy(
    SAML_OPTIONS,
    (request, profile, done) => {
        return done(null, {id: profile.uid, email: profile.email});
    }
);
const SESSION_CONFIG = {
    store: new pgSession({
        pool: new pg.Pool({
            user: DB_SESSION_USER,
            password: DB_SESSION_USER_PASSWORD,
            host: DB_HOST,
            database: DB,
            port: DB_PORT,
            connectionTimeoutMillis: 30000,
            idleTimeoutMillis: 10000,
        })
    }),
    secret: ' secret spud ',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
        secure: IS_PROD,
    }
};
const UPLOAD_AUTHORIZED_USERS = [
    'tomasz.wojtaszek',
    'ivan.navarro',
    'edna.prado',
    'jeremiah.sullivan',
    'vassilios.tsiglifis',
    'christopher.hough',
    'owen.crandall',
];

function isAuthenticated(request, response, next) {
    if (!request.session || !request.user) {
        response.status(401);
        response.append('WWW-Authenticate', 'HOBA');
        response.send();
        return;
    }
    next();
};

function isUploadAuthorized(request, response, next) {
    if (!canUpload(request.user)) {
        response.status(403);
        response.send();
        return;
    }
    next();
};
function canUpload(user) {return IS_DEV || UPLOAD_AUTHORIZED_USERS.includes(user.id);};

async function getSecret() {
    const secrets_client = new SecretsManagerClient({
        credentials: fromContainerMetadata({
            timeout: 1000,
            maxRetries: 0,
        }),
    });
    return secrets_client.send(new GetSecretValueCommand({
        SecretId: SECRET_NAME,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    }))
        .then((response) => {
            return JSON.parse(response.SecretString);
        })
        .catch((error) => {
            // For a list of exceptions thrown, see
            // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
            console.error(error);
            throw error;
        })
};

async function connectToDB(mode) {
    let config = {
        host: DB_HOST,
        port: DB_PORT,
        database: DB
    };
    switch (mode) {
        case 'query':
            config.user = DB_READ_USER;
            config.password = DB_READ_USER_PASSWORD;
            break;
        case 'upload':
            if (IS_DEV) {
                config.user = DB_USER;
                config.password = DB_PASSWORD;
            } else if (IS_PROD) {
                const secret = await getSecret();
                config.user = secret.username;
                config.password = secret.password;
                config.ssl = {
                    require: true,
                    rejectUnauthorized: true,
                    ca: readFileSync(join(__dirname, 'rds-ca-cert.pem')).toString()
                };
            }
            break;
    }
    const client = new pg.Client(config);
    await client.connect()
        .then(() => console.log(`Connected to ${config.database} as ${config.user} at ${config.host}:${config.port}`))
        .catch((error) => {
            console.error('Connection error:', error.stack)
        });
    return client;
};

async function disconnectFromDB(client) {
    await client.end()
        // .then(() => console.log(DB_USER, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
        });
};

const app = express();

// Dev passport strategy
if (IS_DEV) {
    passport.use(new localStrategy((username, password, done) => {
        if (username === password) {
            return done(null, {id: 1, username: username});
        } else {
            return done(null, false, {message: 'Invalid credentials'});
        }
    }));
}
// Prod passport strategy
if (IS_PROD) {
    app.set('trust proxy', 2);
    passport.use(SAML_STRATEGY);
}

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        // console.log(`Serialize User: ${user.id}`);
        done(null, user);
    });
});
passport.deserializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, user);
    });
});

// console.log('IS_DEV:', IS_DEV);
// console.log('IS_PROD:', IS_PROD);
// console.log('PORT:', PORT);
// console.log('DB_USER:', DB_USER);
// console.log('DB_HOST:', DB_HOST);
// console.log('DB_PORT:', DB_PORT);
// console.log('DB:', DB);
// console.log('DB_PASSWORD:', DB_PASSWORD);

app.use(json());
app.use(urlencoded({extended: true}));
app.use(session(SESSION_CONFIG));
app.use(passport.initialize());
app.use(passport.session());

app.use((request, response, next) => {
    let filename = basename(request.url);
    let extension = extname(filename);
    if (FILE_EXT.includes(extension)) {
        if (request.user) {
            console.log(`Serving file ${filename} for user ${request.user.id}`);
        } else {
            console.log(`Serving file ${filename} for session ${request.sessionID}`);
        }
    }
    next();
});

app.use('/', express.static(join(__dirname, 'dist')));

if (IS_DEV) {
    app.use((request, response, next) => {
        response.append('Access-Control-Allow-Origin', ['*']);
        response.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        response.append('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
    app.post('/login', passport.authenticate('local', {failureMessage: true}), (request, response) => {
        response.status(200).json({
            status: 200,
            user: request.user
        });
    });
}
if (IS_PROD) {
    app.post('/login/callback', urlencoded({extended: false}), passport.authenticate('saml', {failureFlash: true}), (request, response) => {
        response.sendFile(join(__dirname, 'dist', 'src', 'html', 'index.html'));
    });
    
    app.get('/login', urlencoded({extended: false}), passport.authenticate('saml', {failureFlash: true}));
}

app.get('/checkAuth', isAuthenticated, (request, response) => {
    response.status(200).json({
        status: 200,
        user: request.user,
        uploadAuthorized: canUpload(request.user)
    });
});
    
app.get(/^\/(?!api\/).*$/, (request, response) => {
    response.sendFile(join(__dirname, 'dist', 'src', 'html', 'index.html'));
});

app.get('/api/getFilters', isAuthenticated, async (request, response, next) => {
    let filtersJSON = {};
    const client = await connectToDB('query');
    for (const i in ROW_FILTERS) {
        let field = ROW_FILTERS[i];
        await client.query({
            rowMode: 'array',
            text: OPTION_QUERIES[field]
        })
            .then((result) => {
                filtersJSON[field] = [];
                result.rows.forEach((row) => {
                    if (row != '') {filtersJSON[field].push(row[0]);}
                });
            })    
            .catch((error) => {
                console.error('Query error:', error.stack);
                next(error);
            })
    }
    await disconnectFromDB(client);
    response.json(filtersJSON);
});

app.get('/api/getOptions', isAuthenticated, async (request, response, next) => {
    let optionsJSON = {};
    const client = await connectToDB('query');
    for (const field in OPTION_QUERIES) {
        await client.query({
            rowMode: 'array',
            text: OPTION_QUERIES[field]
        })
            .then((result) => {
                optionsJSON[field] = [];
                result.rows.forEach((row) => {
                    if (row != '') {optionsJSON[field].push(row[0]);}
                });
            })    
            .catch((error) => {
                console.error('Query error:', error.stack);
                next(error);
            })
    }
    await disconnectFromDB(client);
    response.json(optionsJSON);
});

app.get('/api/query', isAuthenticated, async (request, response, next) => {
    let columns = Array.isArray(request.query.column) ? request.query.column : [request.query.column];
    let sort = {
        column: request.query.sortColumn,
        direction: request.query.sortDirection === 'ascending' ? 'ASC' : 'DESC'
    };
    let params = null;
    let conditions = [];
    if (request.query.params) {
        params = JSON.parse(request.query.params);
        let queryObject = {}
        for (const i in params) {
            if (!Object.keys(queryObject).includes(params[i].field)) {
                queryObject[params[i].field] = [];
            }
            //Will want to make a list/object that groups fields into numerical, categorical, or lexicographical
            //Handle numerical
            if (['serial_number', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(params[i].field)) {
                if (params[i].relation === 'between') {
                    let lowerValue = (params[i].field === 'serial_number') ? params[i].lowerValue : parseFloat(params[i].lowerValue);
                    let higherValue = (params[i].field === 'serial_number') ? params[i].value : parseFloat(params[i].value);
                    queryObject[params[i].field].push(format(`(%I >= %L AND %I <= %L)`, params[i].field, lowerValue, params[i].field, higherValue));
                } else {
                    let value = (params[i].field === 'serial_number') ? params[i].value : parseFloat(params[i].value);
                    queryObject[params[i].field].push(format(`%I ${params[i].relation} %L`, params[i].field, value));
                }
            //Handle categorical
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(params[i].field)) {
                queryObject[params[i].field].push(params[i].value);
            //Handle lexicographical 
            } else if (['supplementary_details'].includes(params[i].field)) {
                queryObject[params[i].field].push(format(`lower(%I) ${params[i].relation} lower('%' || %L || '%')`, params[i].field, params[i].value));
            }
        }
        for (const key in queryObject) {
            if (['serial_number', 'center_frequency', 'supplementary_details', 'review_date', 'expiration_date', 'revision_date'].includes(key)) {
                conditions.push(queryObject[key].join(' OR '));
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(key)) {
                if (key === 'function_identifier') {
                    //I may move this above to better match the pattern of handling different numerical fields
                    conditions.push(format(`(main_function_id IN (%L) OR intermediate_function_id IN (%L) OR detailed_function_id IN (%L))`, queryObject[key], queryObject[key], queryObject[key]));
                //Array column values need to be handled differently by using an array-overlap operator
                } else if (['rx_state_country_code', 'rx_antenna_location', 'station_class'].includes(key)) {
                    conditions.push(withArray(`${key} && '{${'"%s", '.repeat(queryObject[key].length).slice(0, -2)}}'`, queryObject[key]));
                } else {
                    conditions.push(format(`${key} IN (%L)`, queryObject[key]));
                }
            }
        }
    }
    const client = await connectToDB('query');
    let selectSQL = withArray(`SELECT ${'%I, '.repeat(columns.length).slice(0, -2)}`, columns);
    //Modify this when more tables/views are in use
    let fromSQL = format(`FROM RFAs`);
    let whereSQL = withArray(`WHERE ${'%s AND '.repeat(conditions.length).slice(0, -5)}`, conditions);
    let orderBySQL = format(`ORDER BY %I %s`, sort.column, sort.direction);
    let sql = (params && params.length != 0) ? `${selectSQL} ${fromSQL} ${whereSQL} ${orderBySQL}` : `${selectSQL} ${fromSQL} ${orderBySQL}`;
    await client.query(sql)
        .then((result) => {
            console.log('Returned', result.rowCount, 'rows.');
            response.json({
                columns: columns,
                rows: result.rows,
            });
        })    
        .catch((error) => {
            console.error('Query error:', error.stack);
            next(error);
        })
        .finally(async () => {
            await disconnectFromDB(client);
        });
});

app.post('/api/upload', isAuthenticated, isUploadAuthorized, text({limit: '1gb'}), async (request, response, next) => {
    let params = {
        host: DB_HOST,
        port: DB_PORT,
        dbname: DB,
        user: DB_USER,
        password: (IS_DEV) ? DB_PASSWORD : await getSecret.password
    };
    let errorBuffer = '';
    const python = spawn('./upload', [JSON.stringify(params)]);
    python.stdin.write(request.body);
    python.stdin.end();
    python.stdout.on('data', (data) => {
        console.log(`Upload process initiated:\n${data}`);
    });
    python.stderr.on('data', (data) => {
        errorBuffer += data.toString();
        console.log(`stderr:\n${data}`);
    });
    python.on('exit', (code) => {
        if (code === 0) {
            response.json({
                status: code,
                message: 'Upload successful!',
            })
        } else {
            let errorText = '';
            let temp = errorBuffer.split('\n')
            for (const line in temp) {
                if (temp[line].slice(0, 11) === 'Exception: ') {
                    errorText += temp[line].slice(11)+'\n';
                }
            }
            response.json({
                status: code,
                message: errorText,
            });
        }
    });
});

app.listen(PORT, () => {
    console.log('App listening on PORT', PORT);
});