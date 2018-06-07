/**
 * Replace backticks with normal apostrophes
 * @param str String to modify
 * @param isG If is global
 */
export default function toTick(str: string, isG = true) {
  return str.replace(isG ? /`/g : /`/, "'");
}
