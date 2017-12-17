const { Message } = require("discord.js");
const Command = require("../../classes/command");

const func = async (msg, { send }) => {
  const now = Date.now();
  const sentmsg = await send("Calculating ping...");
  const ping = Date.now() - now; // tslint:disable-line:no-shadowed-variable
  let pingRate;
  if (ping < 0) {
    pingRate = ", uh, ...*unexistent*";
  } else if (ping === 0) {
    pingRate = " ***legendary***";
  } else if (ping < 100) {
    pingRate = " *super fast*";
  } else if (ping < 200) {
    pingRate = " *pretty fast*";
  } else if (ping < 300) {
    pingRate = " *fast*";
  } else if (ping < 400) {
    pingRate = " *sort of fast*";
  } else if (ping < 500) {
    pingRate = " *kind of slow*";
  } else if (ping < 600) {
    pingRate = " *slow*";
  } else if (ping < 700) {
    pingRate = " *pretty slow*";
  } else {
    pingRate = " *very, very slow*";
  }
  sentmsg.edit(`Pong! The ping is ${Date.now() - now}ms.
I'd rate the speed as${pingRate}.`);
};
module.exports = new Command({
  func,
  name: "ping",
  perms: "ping",
  default: true,
  description: "View the ping of the bot.",
  example: "{p}ping",
  category: "Utility",
  guildOnly: false,
});
