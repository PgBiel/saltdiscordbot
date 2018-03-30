import db from "../../classes/database";

/**
 * Fetch prefix from database
 * @param {string} guildId ID of the guild
 * @returns {string} The prefix
 */
export default async (guildId?: string) => {
  const dbPrefix: string = guildId ? (await (db.table("prefixes").get(guildId))) : null;
  return dbPrefix || "+";
};
