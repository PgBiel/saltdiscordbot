import { default as send } from "./send";
import { default as reply } from "./reply";
import { Message } from "discord.js";

export default (msg: Message) => ({ send: send(msg), reply: reply(msg) });
