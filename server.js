import { join, basename, extname, dirname } from 'path';
import express, { json, urlencoded } from 'express';
import session from 'express-session';
import { readFileSync } from 'fs';
// const cors = require('cors');
import pg from 'pg';
import format, { withArray } from 'pg-format';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { fromContainerMetadata, fromSSO } from '@aws-sdk/credential-providers';
import passport from 'passport';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import passportLocal from 'passport-local';
const localStrategy = passportLocal.Strategy;
import { fileURLToPath } from 'url';
import connectPgSimple from 'connect-pg-simple';
const pgSession = connectPgSimple(session);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IS_DEV = process.env.NODE_ENV.trim() === 'development';
const IS_PROD = process.env.NODE_ENV.trim() === 'production';
const PORT = process.env.PORT || 7007;
const FILE_EXT = ['.css', '.html', '.js'];
// const DB_USER = process.env.DB_USER || 'postgres';
const DB_USER = process.env.DB_USER || 'OCrandall';
// const DB_HOST = process.env.DB_HOST || 'spud-test-1.cduw4y6qos2l.us-east-1.rds.amazonaws.com';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB = process.env.DB || 'SpUD';
const DB_PASS = process.env.DB_PASS;
const SECRET_NAME = "rds!db-3440bb27-4aa0-4767-bf5c-63bf095df745";
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
    issuer: 'rfmd-spud.woc.noaa.gov',
    callbackUrl: 'rfmd-spud.woc.noaa.gov/login/callback',
    logoutCallbackURL: 'rfmd-spud.woc.noaa.gov/logout',
    entryPoint: 'https://sso-dev.noaa.gov:443/openam/SSORedirect/metaAlias/cac/cac-idp',
    idpCert: [readFileSync(join(__dirname, 'idp_cert1.pem'), 'latin1'), readFileSync(join(__dirname, 'idp_cert2.pem'), 'latin1')],
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
        console.log('Verify')
        console.log(`Session ID: ${request.session.id}`)
        console.log(`Request Cookie: ${JSON.stringify(request.session.cookie)}`);
        return done(null, {id: profile.uid, email: profile.email});
    }
);
// const CORS_OPTIONS = {
//     origin: 'https://sso-dev.noaa.gov',
//     optionsSuccessStatus: 200
// };

const app = express();

const pgPool = await new Promise((resolve) => {
    if (IS_DEV) {
        resolve(new pg.Pool({
            user: DB_USER,
            password: DB_PASS,
            host: DB_HOST,
            database: DB,
            port: DB_PORT,
            connectionTimeoutMillis: 30000,
            idleTimeoutMillis: 10000,
        }));
    } else {
        // TODO: Will need testing in production
        let secrets_client = new SecretsManagerClient({
            credentials: fromContainerMetadata({
                timeout: 1000,
                maxRetries: 0,
            }),
        });
        let config = {
            host: DB_HOST,
            port: DB_PORT,
            database: DB,
            ssl: {
                require: true,
                rejectUnauthorized: true,
                ca: readFileSync(join(__dirname, 'rds-ca-cert.pem')).toString()
            },
        };
        resolve(secrets_client.send(new GetSecretValueCommand({
            SecretId: SECRET_NAME,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        }))
            .then((response) => {
                let secret = JSON.parse(response.SecretString);
                config.user = secret.username;
                config.password = secret.password;
                return new pg.Pool(config);
            })
            .catch((error) => {
                console.error(error);
                throw error;
            })
        );
    }
});

const sessionConfig = {
    store: new pgSession({pool: pgPool}),
    secret: ' secret spud ',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: IS_PROD ? true : false,
    }
};

function isAuthenticated(request, response, next) {
    // if (request.user) {
    //     next();
    // } else {
    //     response.status(401);
    //     response.append('WWW-Authenticate', 'HOBA');
    //     response.send();
    // }
    if (!request.session || !request.user) {
        response.status(403);
        response.append('WWW-Authenticate', 'HOBA');
        response.send();
        return;
    }
    next();
};

async function connectToDB() {
    let config = {
        host: DB_HOST,
        port: DB_PORT,
        database: DB
    };
    if (IS_DEV) {
        // secrets_client = new SecretsManagerClient({
        //     credentials: fromSSO({
        //         profile: 'default',
        //     }),
        // });
        config.user = DB_USER;
        config.password = DB_PASS;
    } else if (IS_PROD) {
        // TODO: Will need testing in production
        let secrets_client = new SecretsManagerClient({
            credentials: fromContainerMetadata({
                timeout: 1000,
                maxRetries: 0,
            }),
        });

        let secret;
        try {
            let response = await secrets_client.send(
                new GetSecretValueCommand({
                    SecretId: SECRET_NAME,
                    VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
                })
            );
            secret = JSON.parse(response.SecretString);
        } catch (error) {
            // For a list of exceptions thrown, see
            // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
            throw error;
        }
        config.user = secret.username;
        config.password = secret.password;
        config.ssl = {
            require: true,
            rejectUnauthorized: true,
            ca: readFileSync(join(__dirname, 'rds-ca-cert.pem')).toString()
        };
    }

    // const secret = JSON.parse(response.SecretString);
    // const client = new Client({
    //     user: secret.username, 
    //     password: secret.password,
    //     host: DB_HOST,
    //     port: DB_PORT,
    //     database: DB,
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: true,
    //         ca: fs.readFileSync(path.join(__dirname, 'rds-ca-cert.pem')).toString()
    //     }
    // });

    const client = new pg.Client(config);

    await client.connect()
        .then(() => console.log('Connected to', DB, 'as', DB_USER, 'at', DB_HOST+':'+DB_PORT))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    return client;
};

// Dev passport strategy
if (IS_DEV) {
    passport.use(new localStrategy((username, password, done) => {
        if (username === password) {
            return done(null, {id: 1, username: username});
        } else {
            return done(null, false, {message: 'Invalid credentials'});
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, {id: user.id, username: user.username});
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
}
if (IS_PROD) {
    passport.use(SAML_STRATEGY);
    // passport.serializeUser((user, done) => {
    //     process.nextTick(() => {
    //         console.log(`Serialize User: ${user.id}`);
    //         done(null, user.id);
    //     });
    //     console.log(`Serialize User: ${user.id}`);
    //     done(null, user.id);
    // });
    passport.serializeUser((user, done) => {
        done(null, {id: user.id});
    });
    // passport.deserializeUser((user, done) => {
    //     process.nextTick(() => {
    //         console.log(`Deserialize User: ${user.id}`);
    //         return done(null, user.id);
    //     });
    // });
    passport.deserializeUser((user, done) => {
        return done(null, user.id);
    });
}

// console.log('IS_DEV:', IS_DEV);
// console.log('IS_PROD:', IS_PROD);
// console.log('PORT:', PORT);
// console.log('DB_USER:', DB_USER);
// console.log('DB_HOST:', DB_HOST);
// console.log('DB_PORT:', DB_PORT);
// console.log('DB:', DB);
// console.log('DB_PASS:', DB_PASS);

app.use(json());
app.use(urlencoded({extended: true}));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.use((request, response, next) => {
    let filename = basename(request.url);
    let extension = extname(filename);
    if (FILE_EXT.includes(extension)) {
        console.log(`Serving file ${filename} for session ${request.sessionID}`);
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
            status: 'Login Successful!',
            user: request.user
        });
    });
}
if (IS_PROD) {
    app.post('/login/callback', isAuthenticated, (request, response) => {
        response.sendFile(join(__dirname, 'dist', 'src', 'html', 'index.html'));
    });
    
    app.get('/login', urlencoded({extended: false}), passport.authenticate('saml', {failureFlash: true}), (request, response) => {
        response.json({isAuthenticated: true});
    });
}

app.get('/checkAuth', isAuthenticated, (request, response) => {
    response.status(200).json({
        status: 'Login Successful!',
        user: request.user
    });
});
    
app.get('(?!/api)/*', (request, response) => {
    response.sendFile(join(__dirname, 'dist', 'src', 'html', 'index.html'));
});

app.get('/api/getFilters', isAuthenticated, async (request, response, next) => {
    let filtersJSON = {};
    const client = await connectToDB();
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
    await client.end()
        // .then(() => console.log(DB_USER, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
    response.json(filtersJSON);
});

app.get('/api/getOptions', isAuthenticated, async (request, response, next) => {
    let optionsJSON = {};
    const client = await connectToDB();
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
    await client.end()
        // .then(() => console.log(DB_USER, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
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
            if (['serial_num', 'center_frequency', 'review_date', 'expiration_date', 'revision_date'].includes(params[i].field)) {
                if (params[i].relation === 'between') {
                    let lowerValue = (params[i].field === 'serial_num') ? params[i].lowerValue : parseFloat(params[i].lowerValue);
                    let higherValue = (params[i].field === 'serial_num') ? params[i].value : parseFloat(params[i].value);
                    queryObject[params[i].field].push(format(`(%I >= %L AND %I <= %L)`, params[i].field, lowerValue, params[i].field, higherValue));
                } else {
                    let value = (params[i].field === 'serial_num') ? params[i].value : parseFloat(params[i].value);
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
            if (['serial_num', 'center_frequency', 'supplementary_details', 'review_date', 'expiration_date', 'revision_date'].includes(key)) {
                conditions.push(queryObject[key].join(' OR '));
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(key)) {
                if (key === 'function_identifier') {
                    //I may move this above to better match the pattern of handling different numerical fields
                    conditions.push(format(`(main_function_id IN (%L) OR intermediate_function_id IN (%L) OR detailed_function_id IN (%L))`, queryObject[key], queryObject[key], queryObject[key]));
                //Array column values need to be handled differently by using an array-overlap operator
                } else if (['rx_state_country_code', 'rx_antenna_location'].includes(key)) {
                    conditions.push(withArray(`${key} && '{${'"%s", '.repeat(queryObject[key].length).slice(0, -2)}}'`, queryObject[key]));
                } else {
                    conditions.push(format(`${key} IN (%L)`, queryObject[key]));
                }
            }
        }
    }
    const client = await connectToDB();
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
            await client.end()
                // .then(() => console.log(DB_USER, 'has successfully disconnected.'))
                .catch((error) => {
                    console.error('End error:', error.stack);
                    next(error);
                });
        });
});

app.listen(PORT, () => {
    console.log('App listening on PORT', PORT);
});