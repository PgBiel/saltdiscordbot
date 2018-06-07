/**
 * Remove double tick
 * @param str String
 * @param isG If is global
 */
export default function no2Tick(str: string, isG = true) {
  return str.replace(isG ? /``/g : /``/, "`\u200B`");
}
