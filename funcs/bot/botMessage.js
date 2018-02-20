const rejct = require("../util/rejct");

module.exports = function botMessage(msg) {
  const thingy = require("../commandHandler")(msg);
  if (thingy.catch) thingy.catch(rejct);
};
