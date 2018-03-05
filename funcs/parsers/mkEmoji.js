const { Constants } = require("../../util/deps");

module.exports = function mkEmoji(id, name = "potato", { isEmj = false, isMention = true } = {}) {
  let idToUse, nameToUse;
  if (isEmj) {
    let reg;
    if (Constants.regex.EMOJI_TEXT.test(id)) {
      reg = Constants.regex.EMOJI_TEXT;
    } else if (Constants.regex.EMOJI_RESOLVED.test(id)) {
      reg = Constants.regex.EMOJI_RESOLVED;
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
};
