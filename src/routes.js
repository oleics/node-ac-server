
/*
  ctx.routesJsLookupFolders
  ctx.routesJs
  ctx.routing
  ctx.app
*/

var fs = require('fs');
var path = require('path');

module.exports = {
  searchRoutesJs: searchRoutesJs,
  loadRoutesJs: loadRoutesJs,
  useRoutesJs: useRoutesJs,
  searchAndUseRoutesJs: searchAndUseRoutesJs,
};

function searchRoutesJs(ctx) {
  var folders = ctx.routesJsLookupFolders.slice(0);
  return lookupAndLoad();
  function lookupAndLoad() {
    if(!folders.length) {
      return Promise.resolve(ctx);
    }
    return loadRoutesJs(folders.shift(), ctx.routesJs)
      .then(function(routing){
        ctx.routing = routing;
        return ctx;
      })
      .catch(function(err){
        return lookupAndLoad();
      })
    ;
  }
}

function loadRoutesJs(folder, routesJs) {
  return new Promise(function(resolve, reject) {
    var file = path.join(folder, routesJs||'routes.js');
    fs.stat(file, function(err, s) {
      if(err) return reject(err);

      console.log('routes.js found: %s', file);
      resolve(require(file));
    });
  });
}

function useRoutesJs(ctx) {
  if(ctx.routing) {
    console.log('Routes');
    ctx.routing.routes.forEach(function(route){
      if(route.method) {
        route.method.forEach(function(method){
          console.log('  %s %s', method, route.path);
          ctx.app[method.toLowerCase()](route.path, route.fn);
        });
        return;
      }
      console.log('  * %s', route.path);
      ctx.app.use(route.path, route.fn);
    });
  }
  return ctx;
}

function searchAndUseRoutesJs(ctx) {
  return searchRoutesJs(ctx).then(useRoutesJs);
}
