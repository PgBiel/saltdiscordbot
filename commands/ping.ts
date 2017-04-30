import { Message } from "discord.js";
import Command from "../classes/command";

const func = async (msg: Message, { send }) => {
  const now = Date.now();
  const sentmsg = await send("Calculating ping...");
  sentmsg.edit(`Pong! ${Date.now() - now}ms.`);
};
export const ping = new Command({
  func,
  name: "ping",
  description: "View the ping of the bot.",
  example: "{p}ping",
  category: "Utility",
  guildOnly: false,
});
