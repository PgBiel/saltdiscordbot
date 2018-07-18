import { Message, MessageEmbed } from "discord.js";
import { ExtendedMsgOptions } from "../senders/proto-send";
import rejct from "../../funcs/util/rejct";
import _send from "../senders/send";

export default (msg: Message) =>
  /**
   * Send an embed
   */
  (emb: MessageEmbed, opts?: ExtendedMsgOptions) => {
    const send = _send(msg);
    return send(Object.assign({ embed: emb, autoCatch: false, deletable: true }, opts))
      .catch(err => [403, 50013].includes(err.code) ?
        send("Please make sure I can send embeds in this channel.") :
        void(rejct(err, "[SEND-IT-INFO]"))
      );
  };
