import Regex from "../../constants/files/regex";

const { EMOJI_TEXT, EMOJI_RESOLVED } = Regex;

export default function mkEmoji(
  id: string, name: string = "potato",
  { isEmj = false, isMention = true }: { isEmj?: boolean, isMention?: boolean } = { isEmj: false, isMention: false }
): string {
  let idToUse: string;
  let nameToUse: string;
  if (isEmj) {
    let reg;
    if (EMOJI_TEXT.test(id)) {
      reg = EMOJI_TEXT;
    } else if (EMOJI_RESOLVED.test(id)) {
      reg = EMOJI_RESOLVED;
    }
    const [, zeName, zeId] = id.match(reg);
    if (!zeId) return id;
    idToUse = zeId;
    nameToUse = zeName || name || "potato";
  } else {
    idToUse = id;
    nameToUse = name || "potato";
  }
  return isMention ? `<:${nameToUse}:${idToUse}>` : `${nameToUse}:${idToUse}`;
}
