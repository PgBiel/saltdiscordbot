const logger = require("../../classes/logger");
/**
 * Handle a rejection
 * @param {*} rejection The rejection to handle
 * @param {*} [prefix] Text to use before the error message
 * @returns {void}
 */
module.exports = function rejct(reject, prefix) {
  // console.log(require("util").inspect(require("./deps")));
  logger.custom(
    (prefix ? prefix + " " : "") + (reject && reject.stack ? reject.stack : reject),
    { prefix: "[ERR/REJECT]", color: "red", type: "error" }
  );
};
