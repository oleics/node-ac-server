
var routes = [];

routes.push({
  path: '/',
  fn: function(req, res, next) {
    res.json({
      name: req.ctx.pkg.name,
      version: req.ctx.pkg.version,
    }).end();
  },
});

module.exports = {
  routes: routes
};
