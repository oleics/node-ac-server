
var all = {};

[
  require('./src/context'),
  require('./src/server'),
  require('./src/server-upgrade'),
  require('./src/app'),
  require('./src/routes'),
  require('./src/batteries'),
  require('./src/service-proxy'),
].forEach(function(api){
  Object.keys(api).forEach(function(key){
    if(all[key] != null) {
      throw new Error('Key "'+key+'" already in use.');
    }
    all[key] = api[key];
  });
});

module.exports = all;
