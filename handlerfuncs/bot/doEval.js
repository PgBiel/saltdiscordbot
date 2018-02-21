const deps = require("../../util/deps");
const funcs = require("../../funcs/funcs");
const { bot, db, messager } = deps;

module.exports = msg => {
  const { channel, guild } = msg;
  const guildId = guild ? guild.id : null;
  return (content, subC = {}) => {
    const handlerFuncs = require("../commandHandlerFuncs"); // lazy require to not mess up things
    const objectToUse = Object.assign({}, handlerFuncs, {
      bot, msg, message: msg,
      channel, guildId, deps,
      funcs, context: subC || {},
      guild, db
    });
    const data = {
      content,
      id: Date.now(),
      vars: objectToUse
    };
    return messager.awaitForThenEmit("doEval", data, data.id + "eval");
  };
};
