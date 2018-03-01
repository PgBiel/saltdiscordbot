const { Constants } = require("../../util/deps");
const collectReact = require("../../funcs/bot/collectReact");
const rejct = require("../../funcs/util/rejct");

module.exports = msg => {
  const { author, channel, guild } = msg;
  return func => { // factory for sending functions
    return (content, options) => {
      if (typeof content === "object" && !options && !(content instanceof Array)) {
        options = content;
        content = "";
      } else if (!options) {
        options = {};
      }
      const result = func(content, options);
      if (options.autoCatch == null || options.autoCatch) {
        result.catch(rejct);
      }
      return result.then(messg => {
        if (channel.typing) channel.stopTyping();
        if (options.deletable) { // react with a deleting emoji
          if (
            messg && // message was sent successfully
            messg.react && // message was actually sent successfully
            guild && // we're in a guild
            guild.me.hasPermission(["ADD_REACTIONS"]) && // I can add reactions
            channel && // ????
            channel.permissionsFor(guild.me).has(["ADD_REACTIONS"]) // I can definitely add reactions
          ) {
            collectReact(messg, Constants.emoji.WASTEBASKET, author.id)
              .catch(err => rejct(err, "[TRASH-REACT-1]"));
          }
        }
        return messg;
      });
    };
  };
};
