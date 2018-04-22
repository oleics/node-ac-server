
var http = require('http');

module.exports = {
  runMainOrLeafServer: runMainOrLeafServer,
  runLeafServer: runLeafServer,
  getMainServerUrl: getMainServerUrl,
  setContextOnRequests: setContextOnRequests,
};

function runMainOrLeafServer(ctx) {
  return new Promise(function(resolve, reject) {
    var server = http.createServer();
    server.once('error', onceError);
    server.once('listening', onceListening);

    server.listen(ctx.port);

    function onceListening() {
      server.removeListener('error', onceError);
      var url = getServerUrl(server);
      console.log('Listening: %s (main)', url);
      ctx.server = server;
      resolve(setContextOnRequests(ctx));
    }

    function onceError(err) {
      server.removeListener('listening', onceListening);
      if(err.code !== 'EADDRINUSE') {
        return reject(err);
      }
      resolve(runLeafServer(ctx));
    }
  });
}

function runLeafServer(ctx) {
  return new Promise(function(resolve, reject) {
    var server = http.createServer();
    server.once('listening', onceListening);
    server.once('error', onceError);
    server.listen();
    function onceListening() {
      server.removeListener('error', onceError);
      var url = getServerUrl(server);
      console.log('Listening: %s (leaf)', url);
      ctx.server = server;
      resolve(setContextOnRequests(ctx));
    }
    function onceError(err) {
      server.removeListener('listening', onceListening);
      if(err.code !== 'EADDRINUSE') {
        return reject(err);
      }
      resolve(runLeafServer(ctx));
    }
  });
}

function getMainServerUrl(ctx) {
  var url = 'http://localhost:'+ctx.port;
  return url;
}

function getServerUrl(server) {
  var address = server.address();
  var url = 'http://localhost:'+address.port;
  return url;
}

function setContextOnRequests(ctx) {
  ctx.server.on('request', function(req, res){
    if(req.ctx == null) {
      req.ctx = ctx;
    }
  });
  return ctx;
}
