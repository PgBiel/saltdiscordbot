import { User } from "discord.js";
import { bot } from "../../util/deps";
import { ICleanUser } from "./cleanUser";
import uncleanPresence from "./uncleanPresence";

/**
 * Generate an user from a raw user object (cleaned).
 * @param user The cleaned user to unclean
 * @returns User generated
 */
export default function uncleanUser(user: ICleanUser) {
  if (user == null || typeof user !== "object") return user as never;
  return bot.users.resolve(user.id);
  // const { presence } = user;
  // const genUser = new User(bot, user);
  // if (presence) {
  //   bot.presences.set(user.id, uncleanPresence(presence));
  // }
  // return genUser;
}
