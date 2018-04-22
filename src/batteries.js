
var express = require('express');

module.exports = {
  serveStaticFiles: serveStaticFiles,
};

function serveStaticFiles(ctx) {
  ctx.staticFolders.forEach(function(folder){
    ctx.app.use(express.static(folder));
  });
  return ctx;
}
