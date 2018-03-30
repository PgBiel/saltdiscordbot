import { MessageReaction } from "discord.js";
import cleanUser, { ICleanUser } from "./cleanUser";

/**
 * Clean reaction
 * @property {number} count amount of reactions
 * @property {boolean} me if I have reacted
 * @property {string} message msg id
 * @property {Array<ICleanUser>} users USers
 */
export interface ICleanReaction {
  count: number;
  me: boolean;
  message: string;
  users: ICleanUser[];
}

export default function cleanReaction(reaction: MessageReaction): ICleanReaction {
  if (reaction == null || typeof reaction !== "object") return reaction as never;
  const { count, me, message, users } = reaction;
  return {
    count,
    me,
    message: message.id,
    users: users.map(u => cleanUser(u))
  };
}
