import protoSend, { IPSPartialMessage } from "./proto-send";
import { Message } from "discord.js";

export default (msg: IPSPartialMessage) => msg && msg.channel ? protoSend(msg)(msg.channel.send.bind(msg.channel)) : null;
