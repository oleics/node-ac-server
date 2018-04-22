
var path = require('path');
var minimist = require('minimist');

module.exports = {
  createContext: createContext,
};

function createContext(ctx) {
  if(ctx != null) return ctx;

  var argv = minimist(minimist(process.argv.slice(2))._);
  var cwd = argv.cwd || process.env.PWD || process.cwd();

  ctx = {
    port: process.env.PORT || 3000,
    cwd: cwd,
    routesJs: 'routes.js',
    routesJsLookupFolders: [
      cwd,
      process.env.PWD,
      process.cwd()
    ],
    staticFolders: [
      path.join(cwd, 'build/browser'),
    ],
  };

  return ctx;
}
