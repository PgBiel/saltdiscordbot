const capitalize = require("./capitalize");

/**
 * Format an activity
 * @param {object} activity Activity
 * @param {boolean} [bold=false] If should bold the name
 * @returns {string}
 */
module.exports = function formatActivity(activity, bold = false) {
  if (!activity || typeof activity !== "object") return "";
  const cap = capitalize(activity.type, { lowerCase: true });
  return (cap === "Listening" ? "Listening to" : cap) + " " + (bold ? `**${activity.name}**` : activity.name);
};
