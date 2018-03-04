const rejct = require("../util/rejct");
const rejctF = require("../util/rejctF");
const temp = require("../../util/temp");
const fetchCached = require("../handler/fetchCachedGuilds");

module.exports = async function botMessage(msg) {
  if (msg && msg.guild && !fetchCached(msg.guild.id)) {
    try {
      await msg.guild.members.fetch();
      temp.set("cacheGuilds", (temp.get("cacheGuilds") || []).concat([msg.guild.id]));
    } catch (err) {
      rejct(err, "[BOTMESSAGE-FETCH GUILD CACHE]");
    }
  }
  const thingy = require("../../cmdhandler/commandHandler")(msg);
  if (thingy.catch) thingy.catch(rejctF("[BOTMESSAGE-RUN-COMMAND-HANDLER]"));
};
