/**
 * Uncompress a compressed number
 * @param {string} str Compressed number
 * @returns {string} Uncompressed number (as string)
 */
export default function uncompress(str: string): string {
  str = String(str);
  if (str.length === 1) return str;
  let ret = Buffer.from(str + "=".repeat(str.length % 4), "base64").toString("hex");
  if (String(ret[0]) === "0") {
    ret = ret.substr(1);
  }
  return ret;
}
