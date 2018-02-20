const logger = require("../../classes/logger");
module.exports = function SQLLogger(...stuff) {
  return logger.custom(stuff.join(" "), { prefix: "[SQL]", color: "yellow" });
};
