/**
 * Add specified char if not present.
 * @param {string} text The text
 * @param {string} [char=" "] The character to ensure it ends with
 * @returns {string} The modified text
 */
module.exports = function endChar(text, char = " ") {
  return text.endsWith(char) ? text : text + char;
};
