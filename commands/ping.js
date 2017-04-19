const func = async function(msg, { send }) {
  const now = Date.now();
  const sentmsg = await send("Calculating ping...");
  sentmsg.edit(`Pong! ${Date.now() - now}ms.`);
};
const ping = new Command({
  func,
  name: "ping",
  description: "View the ping of the bot.",
  example: "{p}ping",
  category: "Utility"
});

module.exports = ping;
