/**
 * Capitalize the first letter in a string.
 * @param {string} str The string
 * @param {boolean} all If all initial letters (each space) should be capitalized
 * @returns {string} The modified string
 */
module.exports = function capitalize(str, all = false) {
  if (all) {
    return str.replace(/(?:^|\s+)([\s\S])/g, char => char.toUpperCase());
  }
  return str.replace(/^([\s\S])/, char => char.toUpperCase());
};
