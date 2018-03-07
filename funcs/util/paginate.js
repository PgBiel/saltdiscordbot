/**
 * Paginate text.
 * @param {string} toPage String or array to page
 * @param {number} [count=10] Amount of words/objects per page
 * @param {regex} [split=/(?:([\w;,..")(\-\d]+)\s*){n}/ig] The string/regex to split by, replaces [n] by wordCount
 * @returns {Array<string|Array<*>>}
 */
module.exports = function paginate(toPage, count = 10, regex = /((?:(?:[\w;,..\")(\-\d]+)\s+){1,[n]})([\w;,..\")(\-\d]+)|([\w;,..\")(\-\d]+)/ig) {
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
  if (typeof toPage === "string") {
    const regexToUse = new RegExp(regex.toString().replace(/^\/|(\/[a-z]+)$/g, "").replace(/\[n\]/, `${count - 1}`), regex.flags);
    return toPage.match(regexToUse);
  } else {
    const arr = [[]];
    let ii = 0;
    for (const obj of toPage) {
      if (arr[ii].length >= count) {
        arr.push([]);
        ii++;
      }
      arr[ii].push(obj);
    }
    return arr;
  }
};
