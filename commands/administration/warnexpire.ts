import Command from "../../classes/command";
import { Time, db, durationdecompress, Interval, durationcompress, parseTimeStr } from "../../misc/d";
import { TcmdFunc } from "../../misc/contextType";

const func: TcmdFunc<{}> = async function(
  msg, {
    seePerm, guildId, reply, checkRole, member, send, args, arrArgs, prefix: p, hasPermission, perms, setPerms,
    prompt, author
  },
) {
  const expire = durationdecompress(
    await (db.table("warnexpires").get(guildId, durationcompress(Interval.weeks(1))))
  );
  if (!args) {
    if (!expire) {
      db.table("warnexpires").set(guildId, durationcompress(Interval.weeks(1)));
      return reply(`Warns on this guild expire after **1 week** (default)!`);
    }
    return reply(`Warns on this guild expire after **${new Interval(expire)}**!`);
  }
  if (!(await seePerm("warnexpire", perms, setPerms, { srole: "administrator" }))) {
    return reply(`Missing permission \`warnexpire\`! Could also use this command with the \`Administrator\` saltrole.`);
  }
  const units = parseTimeStr(args);
  if (Object.values<number>(units).reduce((a, v) => a + v, 0) <= 0) return reply(`Invalid time!`);
  const time: Interval = new Interval(Object.entries(units));
  if (new Interval(time).remove(expire).time === 0) return reply(`That is already the warn expiry time! :wink:`);
  if (time.totalMonths > 3) return reply(`Expiry time must not be longer than 3 months!`);
  if (time.totalMinutes < 1) return reply(`Expiry time must not be shorter than 1 minute!`);
  if ((await (db.table("warns").get(guildId, []))).length > 0 && expire.asMilliseconds() > time.time) {
    const { res: result } = await prompt({
      question: `Are you sure you want to set warns to expire after **${time}**? **Any active warns that have been created \
for longer than that will automatically expire.** This will expire in 15 seconds. Type __y__es or __n__o.`,
      invalidMsg: "__Y__es or __n__o?",
      filter: msg2 => {
        return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
      },
      timeout: Time.seconds(15),
      author
    });
    if (!result) {
      return;
    }
    if (/^[nc]/i.test(result)) {
      send("Command cancelled.");
      return;
    }
  }
  await (db.table("warnexpires").set(guildId, durationcompress(time.duration), true));
  reply(`Successfully set expiry time to **${time}**!`);
};

export const warnexpire = new Command({
  func,
  name: "warnexpire",
  perms: { warnexpire: false },
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
