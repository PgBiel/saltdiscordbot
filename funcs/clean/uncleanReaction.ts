import { MessageReaction } from "discord.js";
import { bot, Message } from "../../util/deps";
import { ICleanReaction } from "./cleanReaction";

export default function uncleanReaction(
  reaction: ICleanReaction,
  message: Message = ({ id: reaction.message, client: bot } as any)
) {
  const msgR = new MessageReaction(
    bot,
    Object.assign({ message }, reaction),
    message
  );
  return msgR;
}
