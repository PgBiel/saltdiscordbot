const logger = require("../../classes/logger");
module.exports = function doError(...stuff) {
  return logger.error.apply(logger, [...stuff]);
}