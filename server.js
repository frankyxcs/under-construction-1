var
    port        = process.env.PORT || 80, // eslint-disable-line
    directory   = '.',
    express     = require('express'),
    compression = require('compression'),
    serveStatic = require('serve-static'),
    app         = express();

app.use(compression({ 'filter' : shouldCompress }));

function shouldCompress (req, res) {
    if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
        return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
}

app.use(serveStatic(directory, {'index': [ 'index.html' ]}));

app.use((req, res) => {
    res.sendFile(`${__dirname}/index.html`); // eslint-disable-line
});

app.listen(port);

console.log(`Marca Profissional rodando na porta ${port}`); // eslint-disable-line
exports = module.exports = app;                             // eslint-disable-line
