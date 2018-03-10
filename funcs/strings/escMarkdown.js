/**
 * Escape Discord markdown in a string.
 * @param {string} str The string.
 * @param {boolean} [escaper=false] If backslash should be escaped.
 * @returns {string} The newly escaped string.
 */
module.exports = function escMarkdown(str, escaper = false) {
  if (typeof str !== "string") return str;
  const regex = new RegExp(`[\`*_~${escaper ? "\\\\" : ""}]`, "g");
  return str.replace(regex, piece => "\\" + piece);
};
