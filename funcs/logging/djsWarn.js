const logger = require("../../classes/logger");

module.exports = function djsWarn(info) {
  logger.custom(info, { prefix: `[DJS WARN]`, color: "yellow" });
};
