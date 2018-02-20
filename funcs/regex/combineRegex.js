/**
 * Combine regexs into one.
 * @param {RegExp[]|string[]} regs The RegExp expressions or strings.
 * @param {string} [flags] The flags.
 * @param {string} [separator=""] Separator between regexes.
 * @returns {RegExp} The combined regex.
 */
module.exports = function combineRegex(regs, flags, separator = "") {
  let regexStr = "";
  for (const match of regs) {
    regexStr += match instanceof RegExp ? match.source : match;
  }
  return new RegExp(regexStr, flags);
};
