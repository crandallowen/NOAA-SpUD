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
            let bureaus = [];
            result.rows.forEach((row) => {bureaus.push(row.bureau)})
            // console.log(bureaus);
            response.json({
                bureaus: bureaus,
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

app.get('/query', async (request, response, next) => {
    let columns = request.query.column;
    let sort = {
        column: request.query.sortColumn,
        direction: request.query.sortDirection === 'ascending' ? 'ASC' : 'DESC'
    };
    const client = new Client(clientConfig);
    await client.connect()
        .then(() => console.log('Connected to', clientConfig.database, 'at', clientConfig.host+':'+clientConfig.port))
        .catch((error) => {
            console.error('Connection error:', error.stack)
            next(error);
        });
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