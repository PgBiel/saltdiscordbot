/**
 * Paginate text.
 * @param {string} text The text
 * @param {number} [wordCount=10] Amount of words per page
 * @param {regex} [split=/(?:([\w;,..")(\-\d]+)\s*){n}/ig] The string/regex to split by, replaces [n] by wordCount
 * @returns {string[]}
 */
module.exports = function paginate(text, wordCount = 10, regex = /((?:(?:[\w;,..\")(\-\d]+)\s+){1,[n]})([\w;,..\")(\-\d]+)|([\w;,..\")(\-\d]+)/ig) {
  /* *** old version *** */
  /* const words = text.split(split);
  const arr = [[]];
  for (let i = 1, ii = 0; i < words.length + 1; i++) {
    const ind = i - 1;
    arr[ii].push(words[ind]);
    if (i % wordCount === 0 && i < words.length) arr[++ii] = [];
  }
  return arr.map(a => a.join(join)); */
  /* *** new version *** */
  const regexToUse = new RegExp(regex.toString().replace(/^\/|(\/[a-z]+)$/g, "").replace(/\[n\]/, `${wordCount - 1}`), regex.flags);
  return text.match(regexToUse);
};
