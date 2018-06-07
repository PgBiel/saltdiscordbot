import logger from "../../classes/logger";
/**
 * Handle a rejection
 * @param {*} reject The rejection to handle
 * @param {*} [prefix] Text to use before the error message
 * @returns {void}
 */
export default function rejct(reject: any, prefix?: string) {
  // console.log(require("util").inspect(require("./deps")));
  logger.custom(
    (prefix ? prefix + " " : "") + (reject && reject.stack ? reject.stack : reject),
    { prefix: "[ERR/REJECT]", color: "red", type: "error" }
  );
}
