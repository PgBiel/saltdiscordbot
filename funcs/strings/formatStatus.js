const capitalize = require("./capitalize");

module.exports = function formatStatus(status) {
  if (typeof status !== "string" || !status) return;
  if (status === "dnd") {
    return "Do Not Disturb";
  }
  return capitalize(status);
};
