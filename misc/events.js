bot.on("ready", _=>{
  global.wasReady = true;
  console.log(colors.green(`Shard ${bot.shard.id} initialized!`));
});
bot.on("debug", info=>{
  djsDebug(info);
});
bot.on("warn", info=>{
  djsWarn(info);
});