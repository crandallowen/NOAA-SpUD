const path = require('path');
const express = require('express');
// const cors = require('cors'); //Will likely be needed for deployment
// const serveStatic = require('serve-static'); //May be able to uninstall
const { Client } = require('pg');
const { clientConfig } = require('./db.config');
const format = require('pg-format');

const app = express();
const port = process.env.PORT || 7007;
const file_ext = ['.css', '.html', '.js'];

const optionQueries = {
    bureaus: `SELECT DISTINCT bureau FROM RFAs ORDER BY bureau ASC`,
    txStateCountryCodes: `SELECT DISTINCT tx_state_country_code FROM RFAs ORDER BY tx_state_country_code ASC`,
    rxStateCountryCodes: `SELECT DISTINCT unnest(rx_state_country_code) AS rx_state_country_code FROM RFAs ORDER BY rx_state_country_code ASC`,
    txAntennaLocations: `SELECT DISTINCT tx_antenna_location FROM RFAs ORDER BY tx_antenna_location ASC`,
    rxAntennaLocations: `SELECT DISTINCT unnest(rx_antenna_location) AS rx_antenna_location FROM RFAs ORDER BY rx_antenna_location ASC`,
    stationClasses: `SELECT DISTINCT unnest(station_class) AS station_class FROM RFAs ORDER BY station_class ASC`,
    functionIdentifiers: `SELECT DISTINCT function_identifier FROM (SELECT main_function_id AS function_identifier FROM RFAs UNION SELECT intermediate_function_id AS function_identifier FROM RFAs UNION SELECT detailed_function_id AS function_identifier FROM RFAs) AS function_identifiers ORDER BY function_identifier ASC`, 
};

const pointOfContactOptions = `SELECT DISTINCT point_of_contact FROM RFAs`;

app.use((request, response, next) => {
    let filename = path.basename(request.url);
    let extension = path.extname(filename);
    if (file_ext.includes(extension)) {
        console.log("Serving file: " + filename);
    }
    next();
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'dist')));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'src', 'html', 'index.html'));
});

app.get('/getOptions', async (request, response, next) => {
    let optionsJSON = {};
    const client = new Client(clientConfig);
    await client.connect()
        .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
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
        .then(() => console.log(clientConfig.user, 'has successfully disconnected.'))
        .catch((error) => {
            console.error('End error:', error.stack);
            next(error);
        });
    // console.log(optionsJSON);
    response.json(optionsJSON);
});

app.get('/query', async (request, response, next) => {
    let columns = request.query.column;
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
            if (params[i].field === 'serial_num' || params[i].field === 'frequency_khz') {
                if (params[i].relation === 'between') {
                    let lowerValue = (params[i].field == 'serial_num') ? `C   ${params[i].lowerValue.padStart(6, '0')}` : parseFloat(params[i].lowerValue);
                    let higherValue = (params[i].field == 'serial_num') ? `C   ${params[i].higherValue.padStart(6, '0')}` : parseFloat(params[i].higherValue);
                    queryObject[params[i].field].push(format(`(%I >= %L AND %I <= %L)`, params[i].field, lowerValue, params[i].field, higherValue));
                } else {
                    let value = (params[i].field == 'serial_num') ? `C   ${params[i].value.padStart(6, '0')}` : parseFloat(params[i].value);
                    queryObject[params[i].field].push(format(`%I ${params[i].relation} %L`, params[i].field, value));
                }
            //Handle categorical
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(params[i].field)) {
                queryObject[params[i].field].push(params[i].value);
            }
        }
        for (const key in queryObject) {
            if (key === 'serial_num' || key === 'frequency_khz') {
                conditions.push(queryObject[key].join(' OR '));
            } else if (['bureau', 'tx_state_country_code', 'rx_state_country_code', 'tx_antenna_location', 'rx_antenna_location', 'station_class', 'function_identifier'].includes(key)) {
                if (key == 'function_identifier') {
                    //I may move this above to better match the pattern of handling different numerical fields
                    conditions.push(format(`(main_function_id IN (%L) OR intermediate_function_id IN (%L) OR detailed_function_id IN (%L))`, queryObject[key], queryObject[key], queryObject[key]));
                } else {
                    conditions.push(format(`${key} IN (%L)`, queryObject[key]));
                }
            }
        }
    }
    console.log(params);
    const client = new Client(clientConfig);
    await client.connect()
        .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    let selectSQL = format.withArray(`SELECT ${'%I, '.repeat(columns.length).slice(0, -2)}`, columns);
    //Modify this when more tables/views are in use
    let fromSQL = format(`FROM RFAs`);
    let whereSQL = format.withArray(`WHERE ${'%s AND '.repeat(conditions.length).slice(0, -5)}`, conditions);
    let orderBySQL = format(`ORDER BY %I %s`, sort.column, sort.direction);
    let sql = (params) ? `${selectSQL} ${fromSQL} ${whereSQL} ${orderBySQL}` : `${selectSQL} ${fromSQL} ${orderBySQL}`;
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
                .then(() => console.log(clientConfig.user, 'has successfully disconnected.'))
                .catch((error) => {
                    console.error('End error:', error.stack);
                    next(error);
                });
        });
});

app.listen(port, () => {
    console.log('App listening on port', port);
});