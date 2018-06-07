import endChar from "./endChar";

/**
 * Pluralize a string based on the amount of the object (if 1, no changes, if)
 * @param str String
 * @param num Number (amount)
 */
export default function pluralize(str: string, num: number) {
  if (typeof str !== "string") return str;
  return num !== 1 ? endChar(str, "s") : str;
}
