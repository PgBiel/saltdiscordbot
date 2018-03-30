import { _, Constants, slugify, tr } from "../../util/deps";

export type ICleanifyStrictness = 0 | 1 | 2 | 3 | 4;

/**
 * Clean a string.
 * @param {string} str String to clean
 * @param {number} [strictness=3] Strictness
 * @returns {string}
 */
export default function cleanify(str: string, strictness: ICleanifyStrictness = 3) {
  if (typeof str !== "string") return str;
  strictness = (Number(_.clamp(strictness, 0, 4)) as ICleanifyStrictness);
  const options = {
    lowercase: true,
    separator: strictness === 0 ? "_" : ""
  };
  const obj = Object.assign({}, Constants.maps.FILTER.greekCyrilic, Constants.maps.FILTER.replace);
  let text: string = slugify(_.deburr(tr(str, strictness >= 3 ? { replace: obj } : {})), options);
  if (strictness === 4) text = text.split("").sort((a, b) => b.charCodeAt(0) - a.charCodeAt(0)).join("");
  if (strictness >= 2) text = text.replace(/(\w)\1+/g, "$1");
  return text;
}
