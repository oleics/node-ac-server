
var express = require('express');

module.exports = {
  createApp: createApp,
  bindAppToServer: bindAppToServer,
};

function createApp(ctx) {
  var app = express();
  app.enable('strict routing');
  app.disable('x-powered-by');
  ctx.app = app;
  return ctx;
}

function bindAppToServer(ctx) {
  ctx.server.on('request', ctx.app);
  return ctx;
}
