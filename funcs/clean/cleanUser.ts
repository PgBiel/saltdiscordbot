import { User } from "discord.js";
import cleanPresence, { ICleanPresence } from "./cleanPresence";

export interface ICleanUser {
  id: string;
  bot: boolean;
  username: string;
  discriminator: string;
  avatar: string;
  presence: ICleanPresence;
}

export default function cleanUser(user: User): ICleanUser {
  if (user == null || typeof user !== "object") return user as never;
  const { id, username, discriminator, bot, avatar, presence } = user;
  return {
    id,
    bot,
    username,
    discriminator,
    avatar,
    presence: cleanPresence(presence)
  };
}
