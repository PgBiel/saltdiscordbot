import { _, bot, db, moment, Time } from "../../util/deps";
import uncompress from "../compression/uncompress";
import dateuncomp from "../compression/dateuncomp";
import durationdecompress from "../compression/durationdecompress";
import durationcompress from "../compression/durationcompress";

/**
 * Check all active warns and remove them if needed.
 * @returns {Promise<void>}
 */
export default async function checkWarns() {
  if (!bot.readyTimestamp) return;
  const awaited = await (db.table("warns").storage());
  const warnsForShard = awaited
    .filter((mute, guildId) => bot.guilds.cache.has(guildId.toString()));
  for (const [guildId, warns] of warnsForShard) {
    const expire = durationdecompress(await (db.table("warnexpires").get(guildId, durationcompress(Time.weeks(1)))));
    if (!expire) continue;
    const guild = bot.guilds.resolve(guildId);
    if (!guild) continue;
    for (const warn of warns) {
      const member = guild.members.resolve(uncompress(warn.userid)); // uncompress user id
      if (!member) continue;
      const warnedAt: Date = dateuncomp(warn.warnedat); // warned at is a compressed date, so we uncompress
      if (!warnedAt) continue;
      const time: number = moment(warnedAt).add(expire).toDate().getTime();
      if (Date.now() >= time) db.table("warns").remArr(guildId, warn); // if expired then d e l e t
    }
  }
}
