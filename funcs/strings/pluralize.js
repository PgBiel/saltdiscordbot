const endChar = require("./endChar");

module.exports = function pluralize(str, num) {
  if (typeof str !== "string") return str;
  return num > 1 ? endChar(str, "s") : str;
};
