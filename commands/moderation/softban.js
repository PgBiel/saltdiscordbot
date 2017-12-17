const { ban } = require("./ban");

const Command = require("../../classes/command");

module.exports = Command.aliasFrom(ban, "softban", {
  perms: "softban",
  default: false,
  description: "Softban someone. (Ban and unban)",
  example: "{p}softban @Person#0000 Spam",
  banType: "softban",
  actions: ["Softbanning", "Softbanned", "softbanned", "Softban", "softban"],
  color: "ORANGE",
  usePrompt: false,
});
