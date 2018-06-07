import protoSend, { ExtendedMsgOptions } from "../../handlerfuncs/senders/proto-send";
import { Message, User, StringResolvable } from "discord.js";

type FuncData = Function & { data: any };

export default function edit(
  msg: Message, data: { author?: User }, contentOrOpts: StringResolvable | ExtendedMsgOptions, opts?: ExtendedMsgOptions
) {
  if (msg && msg.edit) {
    return protoSend(msg, data)(msg.edit.bind(msg))(contentOrOpts, opts);
  }
}
