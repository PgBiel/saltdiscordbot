const { _, Constants, slugify, tr } = require("../../util/deps");

/**
 * Clean a string.
 * @param {string} str String to clean
 * @param {number} [strictness=3] Strictness
 * @returns {string}
 */
module.exports = function cleanify (str, strictness = 3) {
  if (typeof str !== "string") return str;
  strictness = Number(_.clamp(strictness, 0, 4));
  const options = {
    lowercase: true,
    separator: strictness === 0 ? "_" : ""
  };
  const obj = Object.assign({}, Constants.maps.FILTER.greekCyrilic, Constants.maps.FILTER.replace);
  let text = slugify(_.deburr(tr(str, strictness >= 3 ? { replace: obj } : {})), options);
  if (strictness === 4) text = text.split("").sort((a, b) => b.charCodeAt(0) - a.charCodeAt(0)).join("");
  if (strictness >= 2) text = text.replace(/(\w)\1+/g, "$1");
  return text;
};
