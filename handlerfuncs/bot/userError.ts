import reply from "../senders/reply";
import { Message } from "discord.js";

export default (msg: Message) => {
  return (data: string) => reply(msg)(
    `Sorry, but it seems there was an error while executing this command. \
If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);
// TODO: add sending to support server
};
