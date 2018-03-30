import capitalize from "./capitalize";

export default function adaptSnake(text: string | string[], returnArr?: false): string;
export default function adaptSnake(text: string | string[], returnArr?: true): string[];
/**
 * Adapt snake_case to This Lol.
 * @param {string} text snake_case or array of snake_case text to parse
 * @param {boolean} returnArr if should return array
 */
export default function adaptSnake(text: string | string[], returnArr: boolean = false): string | string[] {
  const arr = Array.isArray(text) ? text : text.split(/,\s+|\s+/);
  const newArr: string[] = [];
  for (const el of arr) {
    const genArr: string[] = [];
    const str: string = String(el);
    for (const mStr of str.split(/[_-\s]/)) {
      if (/^(?:VIP|MVP|UR[LI]|US|EU|TTS)$/i.test(mStr)) {
        genArr.push(mStr.toUpperCase());
      } else {
        genArr.push(capitalize(mStr, { lowerCase: true }));
      }
    }
    newArr.push(genArr.join(" "));
  }
  return returnArr ? newArr : newArr.join(", ");
}
