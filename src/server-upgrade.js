
module.exports = {
  handleServerUpgrade: handleServerUpgrade,
};

function handleServerUpgrade(ctx){
  if(ctx.routing && ctx.routing.upgrade) {
    console.log('Binding to upgrade-events...');
    ctx.server.on('upgrade', ctx.routing.upgrade);
  }
  return ctx;
}
