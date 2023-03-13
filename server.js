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
    functionIdentifiers: `SELECT DISTINCT concat(main_function_id, intermediate_function_id, detailed_function_id) AS function_identifier FROM RFAs ORDER BY function_identifier ASC`, 
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
    let params = JSON.parse(request.query.params);
    console.log(params);
    const client = new Client(clientConfig);
    await client.connect()
        .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    //Should change to create a string that is an appropriate number of '%I's and provide an array of the columns
    let columnSQL = columns.join(', ')
    let sql = format('SELECT %s FROM RFAs ORDER BY %I %s', columnSQL, sort.column, sort.direction);
    // console.log(sql);
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