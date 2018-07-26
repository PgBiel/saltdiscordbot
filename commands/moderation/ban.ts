import Command from "../../classes/command";
import { _, Constants, GuildMember, bot, User, logger } from "../../misc/d";
import banP from "../../punishments/ban";
import { TcmdFunc } from "../../misc/contextType";
import { ColorResolvable } from "discord.js";

export interface IBanDummy {
  /**
   * The verbal forms of each action
   * Order:
   * Banning - Banned - banned - Ban - ban
   */
  actions?: [string, string, string, string, string];

  /**
   * Permission
   */
  perms?: string;

  /**
   * Type of ban
   */
  banType?: "ban" | "idban" | "softban";

  /**
   * If the ban needs confirmation
   */
  usePrompt?: boolean;

  /**
   * Amount of days that messages sent up to them will be deleted. Default: 1
   * @type {number}
   */
  days?: number;

  /**
   * If accepts members out of the server. Default: Yes/True
   * @type {boolean}
   */
  outside?: boolean;
}

const func: TcmdFunc<IBanDummy> = async function(msg, {
  guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
  searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  self, seePerm, setPerms
}) {
  const actions: [string, string, string, string, string] = [
    (dummy.actions && dummy.actions[0]) || "Banning",
    (dummy.actions && dummy.actions[1]) || "Banned",
    (dummy.actions && dummy.actions[2]) || "banned",
    (dummy.actions && dummy.actions[3]) || "Ban",
    (dummy.actions && dummy.actions[4]) || "ban"
  ];
  if (!await seePerm(dummy.perms || "ban", perms, setPerms, { hperms: "BAN_MEMBERS" })) {
    return reply(`Missing permission \`${dummy.perms || "ban"}\`! :frowning: Could also use this command with the \
\`Ban Members\` discord permission.`);
  } else if (!botmember.hasPermission(["BAN_MEMBERS"])) {
    return reply("I do not have the permission `Ban Members`! :frowning:");
  }
  if (!args) {
    return reply(`Please tell me who to ${actions[4]}!`);
  }
  let memberToUse: GuildMember | User;
  // const getUser = () => memberToUse instanceof GuildMember ? memberToUse.user : memberToUse;
  const [user, reason]: string[] = _.tail<string>((args.match(Constants.regex.BAN_MATCH) || Array(3)));
  if (!user && !reason) {
    return;
  }
  // logger.debug(user, reason);
  // let id: string;
  let membersMatched;
  if (/[^]#\d{4}$/.test(user)) {
    const split = user.split("#");
    const discrim = split.pop();
    const username = split.join("#");
    memberToUse = guild.members.find(m => m.user.username === username && m.user.discriminator === discrim);
  } else if (/^<@!?\d+>$/.test(user)) {
    memberToUse = guild.members.get(user.match(/^<@!?(\d+)>$/)[1]);
  }
  if (!memberToUse) {
    membersMatched = searcher.searchMember(user);
  }
  if (membersMatched && membersMatched.length < 1) {
    // return reply("Member not found!");
  } else if (membersMatched && membersMatched.length === 1) {
    memberToUse = membersMatched[0];
  } else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
    const result = await promptAmbig(membersMatched);
    if (result.cancelled) {
      return;
    }
    memberToUse = result.subject;
  } else if (membersMatched) {
    return reply("Multiple members have matched your search. Please be more specific.");
  }
  if (!memberToUse) {
    const outside: boolean = dummy.outside == null || Boolean(dummy.outside);
    if (!/^\d{16,21}$/.test(user) || !outside) {
      return reply("Member not found!");
    }
    if (guild.members.has(user)) {
      memberToUse = guild.members.get(user);
    } else if (bot.users.has(user)) {
      memberToUse = bot.users.get(user);
    } else {
      try {
        memberToUse = await bot.users.fetch(user);
      } catch (err) {
        // User not found.
      }
      if (!memberToUse) {
        // id = user;
        return reply("User not found! (Unknown ID)");
      }
    }
  }
  if (/*!id &&*/ memberToUse.id === member.id) {
    return reply(`You cannot ${actions[4]} yourself!`);
  }
  banP.punish(/*id ||*/ memberToUse, guild, self, {
    author: member, reason, auctPrefix: `[${actions[3]} command executed by ${author.tag}] `, actions,
    usePrompt: dummy.usePrompt == null ? true : dummy.usePrompt, days: dummy.days,
    isSoft: dummy.banType === "softban"
  });
};
export const ban = new Command({
  func,
  name: "ban",
  perms: "ban",
  description: "Ban a member, deleting all of their messages sent up to 1 day ago.",
  example: "{p}ban @EvilGuy#0010 Being evil",
  category: "Moderation",
  args: { member: false, reason: true },
  guildOnly: true,
  default: false,
  aliases: {
    idban: {
      perms: "ban",
      banType: "idban",
      default: false,
      outside: true,
      description: "Ban someone, but using an ID. This allows you to ban people outside the server. \
(Note: Ban has this feature by default.)",
      example: "{p}idban 80351110224678912 Being b1nzy",
      show: true,
      aliases: {
        hackban: {
          // nothing else
        }
      }
    },
    nodelban: {
      perms: "ban",
      default: false,
      description: "Ban someone, but without deleting any of their messages with it.",
      example: "{p}nodelban @EvilGuy#0100 Being evil but not as much",
      days: 0,
      outside: false,
      show: true
    },
    weekdelban: {
      perms: "ban",
      default: false,
      description: "Ban a member, while deleting all of their messages sent up to 1 week ago.",
      example: "{p}weekdelban @HeavySpammer#0142 Spamming a lot",
      days: 7,
      outside: false,
      show: true
    },
    softban: {
      perms: "softban",
      default: false,
      description: "Softban someone. (Ban and unban)",
      example: "{p}softban @Person#0000 Spam",
      banType: "softban",
      outside: false,
      actions: ["Softbanning", "Softbanned", "softbanned", "Softban", "softban"],
      usePrompt: false,
      show: true
    }
  }
});
