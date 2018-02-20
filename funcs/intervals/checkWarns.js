const { _, bot, db, moment } = require("../../util/deps");
const uncompress = require("../compression/uncompress");
const dateuncomp = require("../compression/dateuncomp");
const durationdecompress = require("../compression/durationdecompress");

/**
 * Check all active warns and remove them if needed.
 * @returns {Promise<void>}
 */
async function checkWarns() {
  if (!bot.readyTimestamp) return;
  const awaited = await (db.table("warns").storage());
  const warnsForShard = _.flatten(
    awaited
    .filter((mute, guildId) => bot.guilds.has(guildId.toString()))
    .array()
    .map(([guildId, vals]) => _.flatten(vals.map(val => Object.assign({ serverid: guildId }, val, { old: val }))))
  );
  for (const warn of warnsForShard) {
    const guildId = warn.serverid;
    const guild = bot.guilds.get(guildId);
    if (!guild) continue;
    const member = guild.members.get(uncompress(warn.userid));
    if (!member) continue;
    const expire = durationdecompress(await (db.table("warnexpires").get(guildId, "")));
    if (!expire) continue;
    const warnedAt = dateuncomp(warn.warnedat);
    if (warnedAt == null) continue;
    const time = moment(warnedAt).add(expire).toDate().getTime();
    if (Date.now() >= time) db.table("warns").remArr(guildId, warn.old);
  }
}