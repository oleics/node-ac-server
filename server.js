
var api = require('./index');

var createContext = api.createContext;

var runMainOrLeafServer = api.runMainOrLeafServer;

var handleServerUpgrade = api.handleServerUpgrade;

var createApp = api.createApp;
var bindAppToServer = api.bindAppToServer;

var searchAndUseRoutesJs = api.searchAndUseRoutesJs;
var createAndUseServiceProxy = api.createAndUseServiceProxy;
var registerWithMainServiceProxy = api.registerWithMainServiceProxy;
var serveStaticFiles = api.serveStaticFiles;

//

Promise.resolve(createContext())
  .then(runMainOrLeafServer)
  .then(createApp)
    .then(createAndUseServiceProxy)
    .then(searchAndUseRoutesJs)
    .then(serveStaticFiles)
  .then(bindAppToServer)
  .then(handleServerUpgrade)
  .then(registerWithMainServiceProxy)
  .then(function(ctx){
    // console.dir(ctx);
    console.log('OK up and running');
  })
  .catch(function(err){
    console.error(err.stack||err);
    process.exit(1);
  })
;
