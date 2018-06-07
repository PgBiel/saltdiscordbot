import protoSend, { IPSPartialMessage } from "./proto-send";
import { Message } from "discord.js";

export default (msg: IPSPartialMessage & { reply: typeof Message.prototype.reply }) => msg && msg.reply ?
  protoSend(msg)(msg.reply.bind(msg)) :
  null;
