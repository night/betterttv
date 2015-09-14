var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    request = require('request'),
    url = require('url');

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

var server = function(req, res) {
    var uri = url.parse(req.url).pathname,
        file = path.join(process.cwd(), uri);

    fs.exists(file, function(exists) {
        if (!exists) {
            request.get('http://dev.betterttv.net/' + uri).pipe(res);
            return;
        }

        if (fs.lstatSync(file).isDirectory()) {
            res.writeHead(403);
            res.write('403 Forbidden');
            res.end();
            return;
        }

        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(file).pipe(res);
    });
};

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'test-cdn.betterttv.net.key')),
  cert: fs.readFileSync(path.join(__dirname, 'test-cdn.betterttv.net.cert'))
}, server).listen(443, '127.0.0.1');

http.createServer(server).listen(80, '127.0.0.1');
