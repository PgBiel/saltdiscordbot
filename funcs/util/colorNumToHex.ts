/**
 * Convert a color number to hex.
 * @param {number} num Number to convert
 * @param {boolean} [init=true] If there should be a leading "#" on the string
 * @returns {string}
 */
export default function colorNumToHex(num: number, init: boolean = true): string {
  return (init ? "#" : "") + num.toString(16).padStart(6, "0");
}
