const { bot, Discord: { User, ClientPresenceStore } } = require("../../util/deps");
// const cloneObject = require("../util/cloneObject");
const uncleanPresence = require("./uncleanPresence");

module.exports = function uncleanUser(user) {
  if (user == null || typeof user !== "object") return user;
  const { presence } = user;
  const genUser = new User(bot, user);
  if (presence) { // gotta do some h a x i n g
    /* const clonedPres = new ClientPresenceStore(bot, genUser.client.presences);
    clonedPres.set(user.id, uncleanPresence(presence));
    genUser.client = Object.assign(
      cloneObject(bot),
      { presences: clonedPres }
    ); */
    bot.presences.set(user.id, uncleanPresence(presence));
  }
  return genUser;
};
