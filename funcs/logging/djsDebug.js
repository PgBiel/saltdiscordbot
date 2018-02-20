const logger = require("../../classes/logger");

module.exports = function djsDebug(info) {
  logger.custom(info, {
      prefix: `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`,
      color: "magenta"
  });
};

