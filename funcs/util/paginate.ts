/**
 * Paginate text.
 * @param {string|string[]} toPage String or array to page
 * @param {number} [count=10] Amount of words/objects per page
 * @param {regex} [split=/(?:([\w;,..")(\-\d]+)\s*){n}/ig] The string/regex to split by, replaces [n] by wordCount
 * @returns {Array<string|Array<*>>}
 */
export default function paginate<T = any>(toPage: T[], count?: number, regex?: RegExp): T[][];
export default function paginate(toPage: string, count?: number, regex?: RegExp): RegExpMatchArray;
export default function paginate<T = any>(
  toPage: string | T[], count: number = 10,
  regex: RegExp = /((?:(?:[\w;,..\")(\-\d]+)\s+){1,[n]})([\w;,..\")(\-\d]+)|([\w;,..\")(\-\d]+)/ig
): RegExpMatchArray | T[][] {
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
  } else if (Array.isArray(toPage)) {
    const arr: T[][] = [[]];
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
}
