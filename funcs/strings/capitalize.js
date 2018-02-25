/**
 * Capitalize the first letter in a string.
 * @param {string} str The string
 * @param {object} [options] The options
 * @param {boolean} [options.lowerCase = false] If the rest of string should be set to lower case
 * @param {boolean} [options.all=false] If all initial letters (each space) should be capitalized
 * @returns {string} The modified string
 */
module.exports = function capitalize(str, { lowerCase = false, all = false } = {}) {
  let strToUse;
  if (all) {
    strToUse = (lowerCase ? str.toLowerCase() : str).replace(/(?:^|\s+)([\s\S])/g, char => char.toUpperCase());
  } else {
    strToUse = (lowerCase ? str.toLowerCase() : str).replace(/^([\s\S])/, char => char.toUpperCase());
  }
  return strToUse;
};
