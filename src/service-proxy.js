
var util = require('util');
var http = require('http');
var httpProxy = require('http-proxy');
var getMainServerUrl = require('./server').getMainServerUrl;
var getServerUrl = require('./server').getServerUrl;

module.exports = {
  createAndUseServiceProxy: createAndUseServiceProxy,
  registerWithMainServiceProxy: registerWithMainServiceProxy,
};

function createAndUseServiceProxy(ctx) {
  var app = ctx.app;

  var serviceProxyPath = '/_service';
  var serviceProxy = createServiceProxy(app, serviceProxyPath, getMainServerUrl(ctx));
  app.get(serviceProxyPath, function(req, res, next){
    var hostUrl = req.protocol+'://'+req.headers.host;
    var defaultServices = {};
    defaultServices[ctx.lpkg.name] = {
      url: hostUrl+serviceProxyPath,
      home: hostUrl,
    };
    // console.log(req.protocol);
    res.json({
      env: process.env.NODE_ENV || 'development',
      app: {
        name: ctx.pkg.name,
        version: ctx.pkg.version,
        url: hostUrl+''+(ctx.pkg.name !== ctx.lpkg.name ? '/'+ctx.pkg.name : ''),
      },
      services: Object.assign({
        defaults: defaultServices,
      }, serviceProxy.getServices(serviceProxyPath, hostUrl)),
    });
  });

  ctx.serviceProxy = serviceProxy;

  return ctx;
}

function createServiceProxy(app, p, mainUrl) {
  if(p == null) p = '/_service';

  var services = {};
  var unavailable = {};
  ReverseProxy(app, p);

  return {
    getServices: function(postfix, hostUrl){
      var servicesPublic = {};
      Object.keys(services).forEach(function(name){
        servicesPublic[name] = {
          url: (hostUrl||mainUrl)+'/'+encodeURIComponent(name)+(postfix==null?'':postfix),
          home: (hostUrl||mainUrl)+'/'+encodeURIComponent(name),
        };
      });
      var unavailablePublic = {};
      Object.keys(unavailable).forEach(function(name){
        unavailablePublic[name] = {
          url: (hostUrl||mainUrl)+'/'+encodeURIComponent(name)+(postfix==null?'':postfix),
          home: (hostUrl||mainUrl)+'/'+encodeURIComponent(name),
        };
      });
      return {
        available: servicesPublic,
        unavailable: unavailablePublic,
      };
    },
    register: register,
  };

  function ReverseProxy(app, p) {
    var proxy = httpProxy.createProxyServer({});

    app.get(p, function(req, res, next){
      var name = req.query.name;
      var target = req.query.target;
      if(name == null || target == null) {
        return next();
      }
      delete unavailable[name];
      services[name] = target;
      var publicUrl = mainUrl+'/'+encodeURIComponent(name);
      console.log('New service available: %s %s => %s', name, publicUrl, target);
      res.write(util.format('Registered as a service: %s\n  %s => %s\n', name, publicUrl, target));
      req.setTimeout(0);
      res.once('close', function(){
        unavailable[name] = services[name];
        delete services[name];
        console.log('Service became unavailable: /%s* => target %s', name, target);
      });
    });

    app.get('/:service', function(req, res, next){
      var name = req.params.service;
      if(services[name] == null) {
        return next();
      }
      res.redirect(name+'/');
    });

    app.get('/:service/*?', function(req, res, next){
      var name = req.params.service;
      var service = services[name];
      if(service == null) {
        return next();
      }
      console.log('proxy %s %s %s %s', name, service, req.method, req.url);
      req.url = req.url.slice(name.length+1) || '/';
      proxy.web(req, res, { target: service });
    });
  }

  function register(name, target) {
    // register as a service on main-server
    http.get(mainUrl+p+'?name='+encodeURIComponent(name)+'&target='+encodeURIComponent(target)+'', function(res){
      res.on('data', function(data){
        process.stdout.write(data);
      });
      // quit if connection to server ends
      res.on('end', function(){
        console.log('Connection to main-server lost, shutting down service...');
        process.exit(0);
      });
    }).on('error', function(err) {
      console.error(err.stack||err);
      process.exit(1);
    });
  }
}

function registerWithMainServiceProxy(ctx) {
  if(true !== ctx.isMainServer && getServerUrl(ctx.server) !== getMainServerUrl(ctx)) {
    ctx.serviceProxy.register(ctx.pkg.name, getServerUrl(ctx.server));
  }
  // if(ctx.pkg.name !== ctx.lpkg.name) {
  //   ctx.serviceProxy.register(ctx.pkg.name, getServerUrl(ctx.server));
  // }
  return ctx;
}
