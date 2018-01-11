const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (
  msg, { seePerm, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms },
) {
  const expire = d.uncompress(d.db.table("warnexpire").get(guildId, d.compress(d.Time.weeks(1))));
  if (!args) {
    if (expire < 1) {
      d.db.table("warnexpire").set(guildId, d.compress(d.Time.weeks(1)));
      return reply(`Warns on this guild expire after **1 week** (default)!`);
    }
    return reply(`Warns on this guild expire after **${d.Time(expire)}**!`);
  }
  if (!seePerm("warnexpire", perms, setPerms, { srole: "Administrator" })) return reply(`Missing permission \`warnexpire\`! \
Could also use this command with the Administrator saltrole.`);
  const units = d.parseTime(args);
  if (Object.values(units).reduce((a, v) => a + v, 0) <= 0) return reply(`Invalid time!`);
  const time = d.Time(d._.flatten(Object.entries(units)));
  if (time.time > d.Time.months(3)) return reply(`Expiry time must not be longer than 3 months!`);
  if (time.time < d.Time.minutes(1)) return reply(`Expiry time must not be shorter than 1 minute!`);
  await d.db.table("warnexpire").setRejct(guildId, d.compress(time.time.toString()));
  reply(`Successfully set expiry time to **${time}**!`);+
};

module.exports = new Command({
  func,
  name: "warnexpire",
  perms: { "warnexpire": false },
  description: `Set when a warn expires. By default, a warn expires every 1 week. Use this command to change that. \
The maximum warn expiry time is 3 months, and the minimum is 1 minute.
  
Invoking this command without any arguments shows when warns are set to expire currently. When passing arguments, \
make sure to give a valid time notation. Here, for time notation, the same rules apply as the mute command (see its help \
for details).`,
  example: `{p}warnexpire
{p}warnexpire 1 week
{p}warnexpire 2 months
{p}warnexpire 15 hours 5 minutes`,
  category: "Administration",
  args: { time: true },
  guildOnly: true
});
