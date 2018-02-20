const uncompress = require("./uncompress");

module.exports = function avatarUncompress(end, id) {
  if (end[0] == "-") {
    return `https://cdn.discordapp.com/embed/avatars/${end[1]}.png`;
  }
  if (end[0] == "g") {
    return `https://cdn.discordapp.com/avatars/${id}/a_${uncompress(end.substr(1))}.gif`;
  } else {
    return `https://cdn.discordapp.com/avatars/${id}/${uncompress(end)}.webp`;
  }
};
