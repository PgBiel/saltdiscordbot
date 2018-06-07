import { Guild, Presence } from "discord.js";
import { bot } from "../../util/deps";
import { ICleanPresence } from "./cleanPresence";

export default function uncleanPresence(presence: ICleanPresence) {
  if (presence == null || typeof presence !== "object") return presence as never;
  return new Presence(bot, presence);
}
