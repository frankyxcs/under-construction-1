// Configure Environment
require('dotenv').config();

// Web Server Dependencies
const port        = process.env.PORT || 8080;
const directory   = '.';
const express     = require('express');
const serveStatic = require('serve-static');
const app         = express();
const compression = require('compression');

// Static Serve
app.use(serveStatic(directory, {'index': [ 'index.html' ]}));

// GZIP Compressor
app.use(compression({
    'filter' : (req, res) => {

        // don't compress responses with this request header
        if (req.headers['x-no-compression']) {
            return false;
        }

        // fallback to standard filter function
        return compression.filter(req, res);
    }
}));

// Return index.html
app.use((req, res) => { res.sendFile(`${__dirname}/index.html`); });

// Port Listen
app.listen(port);

// Welcome Msg
console.log(`pling.net.br rodando na porta ${port}`);
exports = module.exports = app;