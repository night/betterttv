const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const request = require('request');
const url = require('url');

process.on('uncaughtException', err => console.log('Caught exception: ', err));

function server(req, res) {
    const uri = url.parse(req.url).pathname;
    const file = path.join(process.cwd(), 'build', uri);

    fs.exists(file, exists => {
        if (!exists) {
            request.get({
                url: 'https://cdn-dev.betterttv.net/' + uri,
                headers: {
                    'Host': 'cdn.betterttv.net'
                }
            }).pipe(res);
            return;
        }

        if (fs.lstatSync(file).isDirectory()) {
            res.writeHead(403);
            res.write('403 Forbidden');
            res.end();
            return;
        }

        if (file.endsWith('.svg')) {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'image/svg+xml'
            });
        } else {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*'
            });
        }

        fs.createReadStream(file).pipe(res);
    });
}

function start() {
    https.createServer({
        key: fs.readFileSync(path.join(__dirname, 'test-cdn.betterttv.net.key')),
        cert: fs.readFileSync(path.join(__dirname, 'test-cdn.betterttv.net.cert'))
    }, server).listen(443);

    http.createServer(server).listen(80);
}

module.exports = start;
