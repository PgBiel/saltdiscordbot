import uncompress from "./uncompress";

/**
 * Uncompress compressed avatar URLs
 * @param {string} end The compressed URL
 * @param {string} id ID of the User
 * @returns {string} The complete URL
 */
export default function avatarUncompress(end: string, id: string) {
  if (end[0] === "-") {
    return `https://cdn.discordapp.com/embed/avatars/${end[1]}.png`;
  }
  if (end[0] === "g") {
    return `https://cdn.discordapp.com/avatars/${id}/a_${uncompress(end.substr(1))}.gif`;
  } else {
    return `https://cdn.discordapp.com/avatars/${id}/${uncompress(end)}.webp`;
  }
}
