var fs = require("fs"),
    http = require("http"),
    path = require("path"),
    request = require("request"),
    url = require("url");

http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname,
      file = path.join(process.cwd(), uri);

  fs.exists(file, function(exists) {
    if(!exists) {
      request.get('http://dev.betterttv.net/'+uri).pipe(res);
      return;
    }

    if(fs.lstatSync(file).isDirectory()) {
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
}).listen(80);