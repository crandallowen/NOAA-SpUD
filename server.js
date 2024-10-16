const path = require('path');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
// const cors = require('cors'); //Will likely be needed for deployment
const { Client } = require('pg');
const format = require('pg-format');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { fromContainerMetadata, fromSSO } = require('@aws-sdk/credential-providers');
const { SAML } = require('@node-saml/passport-saml');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const IS_DEV = process.env.NODE_ENV.trim() === 'development';
const IS_PROD = process.env.NODE_ENV.trim() === 'production';
const PORT = process.env.PORT || 7007;
const FILE_EXT = ['.css', '.html', '.js'];
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'spud-test-1.cduw4y6qos2l.us-east-1.rds.amazonaws.com';
const DB_PORT = process.env.DB_PORT || '5432';
const DB = process.env.DB || 'spud';

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

const app = express();
const saml_options = {};
// const saml = new SAML(saml_options);

// Dev passport strategy
if (IS_DEV) {
    passport.use(new localStrategy((username, password, done) => {
        if (username === 'user' && password === 'password') {
            return done(null, {id: 1, username: 'user'});
        } else {
            return done(null, false, {message: 'Invalid credentials'});
        }
    }));
}

var sessionOptions = {
    secret: ' secret spud ',
    resave: false,
    saveUninitialized: true,
    cookie: {}
};

if (IS_PROD) {
    sessionOptions.cookie.secure = true;
};

function checkAuth(request, response, next) {
    if (request.session.username) {
        next();
    } else {
        response.status(403);
        response.send();
    }
};

async function connectToDB() {
    const secret_name = "rds!db-b1c2087a-1f45-4ad0-a23f-264ad481c0b4";
    let secrets_client;
    if (IS_DEV) {
        secrets_client = new SecretsManagerClient({
            credentials: fromSSO({
                profile: 'default',
            }),
        });
    } else {
        secrets_client = new SecretsManagerClient({
            credentials: fromContainerMetadata({
                timeout: 1000,
                maxRetries: 0,
            }),
        });
    }
    let response;

    try {
        response = await secrets_client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    const secret = JSON.parse(response.SecretString);
    const client = new Client({
        user: secret.username, 
        password: secret.password,
        host: DB_HOST,
        port: DB_PORT,
        database: DB,
        ssl: {
            require: true,
            rejectUnauthorized: true,
            ca: fs.readFileSync(path.join(__dirname, 'rds-ca-cert.pem')).toString()
        }
    });

    await client.connect()
        .then(() => console.log('Connected to', DB, 'as', DB_USER, 'at', DB_HOST+':'+DB_PORT))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    return client;
};

app.use(express.urlencoded({extended: true}));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.use((request, response, next) => {
    let filename = path.basename(request.url);
    let extension = path.extname(filename);
    if (FILE_EXT.includes(extension)) {
        console.log(`Serving file: ${filename}`);
    }
    console.log(`Session: ${request.sessionID}`)
    next();
});

app.use('/', express.static(path.join(__dirname, 'dist')));

app.use((request, response, next) => {
    response.append('Access-Control-Allow-Origin', ['*']);
    response.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/login', (request, response) => {
    console.log(request);
});

app.get('(?!/api)/*', (request, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'src', 'html', 'index.html'));
});

app.get('/api/getFilters', checkAuth, async (request, response, next) => {
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
        .then(() => console.log(DB_USER, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
    response.json(filtersJSON);
});

app.get('/api/getOptions', checkAuth, async (request, response, next) => {
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
        .then(() => console.log(DB_USER, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
    response.json(optionsJSON);
});

app.get('/api/query', checkAuth, async (request, response, next) => {
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
            //Will want to make a list/object that groups fields into numerical or categorical
            //Handle numerical
            if (params[i].field === 'serial_num' || params[i].field === 'center_frequency') {
                if (params[i].relation === 'between') {
                    let lowerValue = (params[i].field === 'serial_num') ? params[i].lowerValue : parseFloat(params[i].lowerValue);
                    let higherValue = (params[i].field === 'serial_num') ? params[i].higherValue : parseFloat(params[i].higherValue);
                    queryObject[params[i].field].push(format(`(%I >= %L AND %I <= %L)`, params[i].field, lowerValue, params[i].field, higherValue));
                } else {
                    let value = (params[i].field === 'serial_num') ? params[i].value : parseFloat(params[i].value);
                    queryObject[params[i].field].push(format(`%I ${params[i].relation} %L`, params[i].field, value));
                }
            //Handle categorical
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(params[i].field)) {
                queryObject[params[i].field].push(params[i].value);
            }
        }
        for (const key in queryObject) {
            if (key === 'serial_num' || key === 'center_frequency') {
                conditions.push(queryObject[key].join(' OR '));
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(key)) {
                if (key === 'function_identifier') {
                    //I may move this above to better match the pattern of handling different numerical fields
                    conditions.push(format(`(main_function_id IN (%L) OR intermediate_function_id IN (%L) OR detailed_function_id IN (%L))`, queryObject[key], queryObject[key], queryObject[key]));
                //Array column values need to be handled differently by using an array-overlap operator
                } else if (['rx_state_country_code', 'rx_antenna_location'].includes(key)) {
                    conditions.push(format.withArray(`${key} && '{${'"%s", '.repeat(queryObject[key].length).slice(0, -2)}}'`, queryObject[key]));
                } else {
                    conditions.push(format(`${key} IN (%L)`, queryObject[key]));
                }
            }
        }
    }
    const client = await connectToDB();
    let selectSQL = format.withArray(`SELECT ${'%I, '.repeat(columns.length).slice(0, -2)}`, columns);
    //Modify this when more tables/views are in use
    let fromSQL = format(`FROM RFAs`);
    let whereSQL = format.withArray(`WHERE ${'%s AND '.repeat(conditions.length).slice(0, -5)}`, conditions);
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
                .then(() => console.log(DB_USER, 'has successfully disconnected.'))
                .catch((error) => {
                    console.error('End error:', error.stack);
                    next(error);
                });
        });
});

app.listen(PORT, () => {
    console.log('App listening on PORT', PORT);
});