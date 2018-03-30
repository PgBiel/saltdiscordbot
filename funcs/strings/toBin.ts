/**
 * Convert a string to binary through ASCII.
 * @param {string} str The string to convert.
 * @param {string} [joinChar] The character to separate each separate digit. " " by default.
 * @param {string} [unicodeJoinChar] The character to separate each character used to make one bigger character.
 * Nothing by default.
 * @returns {string} The converted string.
 */
export default function toBin(str: string, joinChar = " ", unicodeJoinChar = "") {
  const PADDING: string = "0".repeat(8);

  const resultArr: string[] = [];

  if (typeof str !== "string") {
    str = String(str);
  }

  for (const i of Object.keys(str)) {
    if (isNaN(Number(i))) {
      return;
    }
    const compact = str.charCodeAt(Number(i)).toString(2);
    if (compact.length / 8 > 1) {
      const el: string[] = [];
      compact.match(/[^]{8}/g).forEach(byte => {
        const padded2 = PADDING.substring(0, PADDING.length - byte.length) + byte;
        el.push(padded2);
      });
      resultArr.push(el.join(unicodeJoinChar || ""));
      continue;
    }
    const padded = PADDING.substring(0, PADDING.length - compact.length) + compact;
    resultArr.push(padded);
  }
  const result = resultArr.join(joinChar);
  return result;
}
