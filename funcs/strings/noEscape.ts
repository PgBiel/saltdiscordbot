/**
 * Remove escaping backslashes on strings
 * @param {string} str The string]
 * @param {Object} options The options
 * @param {boolean} [options.isG=true] If should be on all backslashes of the string / global (Default true)
 * @param {"whitespace"|"remove"|"sub"} [options.mode="whitespace"] The mode. Whitespace = add a \u200B, Remove = remove it,
 * sub = substitute with a slash
 */
export default function noEscape(
  str: string,
  { isG, mode }: { isG?: boolean, mode?: "whitespace" | "remove" | "sub" } = { isG: true, mode: "whitespace" }
) {
  return str.replace(
    isG ? /\\/g : /\\/,
    mode === "whitespace" ?
      "`\u200B`" :
        mode === "remove" ?
          "" :
          "/"
  );
}
