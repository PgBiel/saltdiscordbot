/**
 * Abstract strings if it is too long.
 * @param {string} text The string to abstract.
 * @param {number} length The max length.
 * @returns {string} The abstracted string.
 */
export default function textAbstract(text: string, length: number) {
  if (text == null) {
    return "";
  }
  if (typeof text !== "string") {
    text = String(text);
  }
  if (typeof length !== "number") {
    if (isNaN(length)) {
      throw new TypeError("Length must be a number!");
    }
    length = Number(length);
  }
  if (text.length <= length) {
    return text;
  }
  const newText = text.substring(0, length).replace(/[^]{0,3}$/, "...");
  return newText || "...";
}
