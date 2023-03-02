const path = require('path');
const url = require('url');
const express = require('express');
// const cors = require('cors'); //Will likely be needed for deployment
// const serveStatic = require('serve-static'); //May be able to uninstall
const { Client } = require('pg');
const {clientConfig} = require('./db.config');

const app = express();
const port = process.env.PORT || 7007;
const file_ext = ['.css', '.html', '.js'];

const getRFAsQuery = `SELECT serial_num, agency_action_num, bureau, main_function_id, intermediate_function_id, detailed_function_id, frequency_khz, station_class, emission_designator, power,
    tx_state_country_code, tx_antenna_location, tx_antenna_latitude, tx_antenna_longitude,
    tx_inclination_angle, tx_apogee, tx_perigee, tx_period_of_orbit, tx_number_of_satellites,
    tx_equipment_nomenclature, tx_system_name, tx_number_of_stations,
    tx_OTS_equipment, tx_radar_tunability, tx_pulse_duration, tx_pulse_repetition_rate,
    tx_antenna_name, tx_antenna_nomenclature, tx_antenna_gain, tx_antenna_elevation, tx_antenna_feed_point_height, tx_antenna_horizontal_beamwidth, tx_antenna_azimuth, tx_antenna_orientation, tx_antenna_polarization,
    rx_state_country_code, rx_antenna_location, rx_antenna_latitude, rx_antenna_longitude,
    rx_inclination_angle, rx_apogee,rx_perigee, rx_period_of_orbit, rx_number_of_satellites,
    rx_equipment_nomenclature, rx_antenna_name, rx_antenna_nomenclature, rx_antenna_gain, rx_antenna_elevation, rx_antenna_feed_point_height, rx_antenna_horizontal_beamwidth, rx_antenna_azimuth, rx_antenna_orientation, rx_antenna_polarization,
    last_transaction_date, revision_date, authorization_date, expiration_date, review_date, entry_date, receipt_date
    FROM RFAs
    ORDER BY frequency_khz`;

const getBureausQuery = `SELECT DISTINCT bureau FROM RFAs`;

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
// app.use('/', express.static(path.join(__dirname, 'src')));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'dist', 'src', 'html', 'index.html'));
    // response.sendFile(path.join(__dirname, 'src', 'html', 'index.html'));
});

app.get('/getRFAs', async (request, response, next) => {
    // let q = url.parse(request.url, true);
    // let columns = q.query['columns'].split(',');
    // Will need to change query formulation to be safe from injection
    // let getRFAsQuery = 'SELECT ' + columns.join(', ') + ' FROM RFAS';
    const client = new Client(clientConfig);
    await client.connect()
        .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    await client.query(getRFAsQuery)
        .then((result) => {
            console.log('Returned', result.rowCount, 'rows.');
            // console.log(result.fields);
            response.json({
                rows: result.rows,
                columns: result.fields
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

app.get('/getBureaus', async (request, response, next) => {
    const client = new Client(clientConfig);
    await client.connect()
        .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
    await client.query(getBureausQuery)
        .then((result) => {
            console.log('Returned', result.rowCount, 'rows.');
            response.json({
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