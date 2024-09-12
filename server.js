const path = require('path');
const express = require('express');
const fs = require('fs');
// const cors = require('cors'); //Will likely be needed for deployment
const { Client } = require('pg');
// const { clientConfig } = require('./db.config'); //Will not be used in production
const format = require('pg-format');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
// const { fromContainerMetadata } = require('@aws-sdk/credential-providers');
const { fromSSO } = require('@aws-sdk/credential-providers');

const app = express();
const port = process.env.PORT || 7007;
const file_ext = ['.css', '.html', '.js'];
const db_user = 'postgres'
const db_host = 'spud-test-1.cduw4y6qos2l.us-east-1.rds.amazonaws.com'
const db_port = '5432'
const database = 'spud'

const optionQueries = {
    'bureau': `SELECT DISTINCT bureau FROM RFAs ORDER BY bureau ASC`,
    'tx_state_country_code': `SELECT DISTINCT tx_state_country_code FROM RFAs ORDER BY tx_state_country_code ASC`,
    'rx_state_country_code': `SELECT DISTINCT unnest(rx_state_country_code) AS rx_state_country_code FROM RFAs ORDER BY rx_state_country_code ASC`,
    'tx_antenna_location': `SELECT DISTINCT tx_antenna_location FROM RFAs ORDER BY tx_antenna_location ASC`,
    'rx_antenna_location': `SELECT DISTINCT unnest(rx_antenna_location) AS rx_antenna_location FROM RFAs ORDER BY rx_antenna_location ASC`,
    'station_class': `SELECT DISTINCT unnest(station_class) AS station_class FROM RFAs ORDER BY station_class ASC`,
    'function_identifier': `SELECT DISTINCT function_identifier FROM (SELECT main_function_id AS function_identifier FROM RFAs UNION SELECT intermediate_function_id AS function_identifier FROM RFAs UNION SELECT detailed_function_id AS function_identifier FROM RFAs) AS function_identifiers ORDER BY function_identifier ASC`, 
};

const rowFilters = ['bureau', 'function_identifier', 'tx_state_country_code'];

const pointOfContactOptions = `SELECT DISTINCT point_of_contact FROM RFAs`;

async function connectToDB() {
    const secret_name = "rds!db-b1c2087a-1f45-4ad0-a23f-264ad481c0b4";
    const secrets_client = new SecretsManagerClient({
        // credentials: fromContainerMetadata({
        //     timeout: 1000,
        //     maxRetries: 0,
        // }),
        credentials: fromSSO({
            profile: 'default',
        }),
    });
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
        host: db_host,
        port: db_port,
        database: database,
        ssl: {
            require: true,
            rejectUnauthorized: true,
            ca: fs.readFileSync(path.join(__dirname, 'rds-ca-cert.pem')).toString()
        }
    });

    await client.connect()
        .then(() => console.log('Connected to', database, 'as', db_user, 'at', db_host+':'+db_port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    return client;
};

app.use((request, response, next) => {
    let filename = path.basename(request.url);
    let extension = path.extname(filename);
    if (file_ext.includes(extension)) {
        console.log("Serving file: " + filename);
    }
    next();
});

app.use('/', express.static(path.join(__dirname, 'dist')));

app.use((request, response, next) => {
    response.append('Access-Control-Allow-Origin', ['*']);
    response.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'src', 'html', 'index.html'));
});

app.get('(?!/api)/*', (request, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'src', 'html', 'index.html'));
});

app.get('/api/getFilters', async (request, response, next) => {
    let filtersJSON = {};
    // const client = new Client(clientConfig);
    // await client.connect()
    //     .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
    //     .catch((error) => {
    //         console.error('Connection error:', error.stack)
    //         next(error);
    //     });
    const client = await connectToDB();
    for (const i in rowFilters) {
        let field = rowFilters[i];
        await client.query({
            rowMode: 'array',
            text: optionQueries[field]
        })
            .then((result) => {
                // console.log(result);
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
        .then(() => console.log(db_user, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
    // console.log(filtersJSON);
    response.json(filtersJSON);
});

app.get('/api/getOptions', async (request, response, next) => {
    let optionsJSON = {};
    // const client = new Client(clientConfig);
    // await client.connect()
    //     .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
    //     .catch((error) => {
    //         console.error('Connection error:', error.stack)
    //         next(error);
    //     });
    const client = await connectToDB();
    for (const field in optionQueries) {
        await client.query({
            rowMode: 'array',
            text: optionQueries[field]
        })
            .then((result) => {
                // console.log(result);
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
        .then(() => console.log(db_user, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
    // console.log(optionsJSON);
    response.json(optionsJSON);
});

app.get('/api/query', async (request, response, next) => {
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
    // console.log(params);
    // const client = new Client(clientConfig);
    // await client.connect()
    //     .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
    //     .catch((error) => {
    //         console.error('Connection error:', error.stack)
    //         next(error);
    //     });
    const client = await connectToDB();
    let selectSQL = format.withArray(`SELECT ${'%I, '.repeat(columns.length).slice(0, -2)}`, columns);
    //Modify this when more tables/views are in use
    let fromSQL = format(`FROM RFAs`);
    let whereSQL = format.withArray(`WHERE ${'%s AND '.repeat(conditions.length).slice(0, -5)}`, conditions);
    let orderBySQL = format(`ORDER BY %I %s`, sort.column, sort.direction);
    let sql = (params && params.length != 0) ? `${selectSQL} ${fromSQL} ${whereSQL} ${orderBySQL}` : `${selectSQL} ${fromSQL} ${orderBySQL}`;
    console.log(sql);
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
                .then(() => console.log(db_user, 'has successfully disconnected.'))
                .catch((error) => {
                    console.error('End error:', error.stack);
                    next(error);
                });
        });
});

app.listen(port, () => {
    console.log('App listening on port', port);
});