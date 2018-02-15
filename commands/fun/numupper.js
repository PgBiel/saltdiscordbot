const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, { args, send, reply, channel, member, author, guild, perms, dummy = {} }) {
  if (guild && !perms[dummy.perm || "numupper"]) return reply("Missing permission `numupper`! :frowning:");
  const arrup = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  if (!args) return reply(dummy.msgEmpty || "Please specify numbers to convert!");
  if (!/\d/.test(msg.content)) return reply(dummy.msgNoNumbers || "Please include at least one number on your text to convert!");
  const embed = new d.Embed()
    .setTitle(dummy.embTitle || "Sent text with all numbers converted")
    .setDescription(typeof dummy.replace === "function" ? dummy.replace(args, arrup) : args.replace(/\d/g, n => arrup[Number(n)]));
  return reply(dummy.sentMsg || `Here is your message with all numbers set to superscript:`, { embed, deletable: true });
};
module.exports = new Command({
  func,
  name: "numupper",
  perms: "numupper",
  default: true,
  description: "Converts all numbers in your message to superscript.",
  example: "{p}numupper 0123456789",
  category: "Fun",
  args: { text: false },
  guildOnly: false
});
