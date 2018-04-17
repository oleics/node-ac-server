
var routes = [];

routes.push({
  path: '/',
  fn: function(req, res, next) {
    res.json({}).end();
  },
});

module.exports = {
  routes: routes
};
