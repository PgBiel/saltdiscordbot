import { Message } from "discord.js";
import Command from "../classes/command";
import { TcmdFunc } from "../commandHandler";

const func: TcmdFunc = async (msg: Message, { send }) => {
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
