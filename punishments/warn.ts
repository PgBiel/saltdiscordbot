import { MessageEmbed, GuildMember, Guild } from "discord.js";
import { Constants, db, logger, Interval, Time, util } from "../util/deps";
import {
  compress, datecomp, dateuncomp, escMarkdown, rejct, rejctF, textAbstract, uncompress, durationcompress,
  durationdecompress
} from "../funcs/funcs";
import Punishment from "./punishment";

import banP from "./ban";
import kickP from "./kick";
import muteP from "./mute";
import { Context } from "../misc/contextType";
import { HelperVals } from "../misc/tableValues";

type WarnStep = HelperVals["warnsteps"];

class Warn extends Punishment {

  /**
   * Warn someone.
   * @param {GuildMember} member The member that is being punished.
   * @param {Object} [options] Options to pass.
   * @param {GuildMember} [options.author] The author of the punishment.
   * @param {string} [options.reason] The reason of the punishment.
   * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
   * @param {BaseContext<GuildChannel>} [options.context] The context of the command.
   * @param {boolean} [options.automatic] If this was an automatic warn.
   * @returns {Promise<void>}
   */
  public async punish(
    member: GuildMember, { author, reason, auctPrefix, context, automatic = false }: {
      author: GuildMember, reason?: string, auctPrefix?: string, context: Context,
      automatic?: boolean
    }
  ): Promise<void> {
    const guild: Guild = member.guild;
    const botmember: GuildMember = guild.me;
    const def = (...args) => Promise.resolve(null);
    const { reply = def as never, send = def as never, actionLog = def as never } = context;
    const sentWarnMsg = await send(`Warning ${member.user.tag}... (Sending DM...)`);
    const warns = await (db.table("warns").filterArr(guild.id, u => uncompress(u.userid) === member.id));
    const warnSteps: WarnStep[] = await (
      db.table("warnsteps").sortArr(guild.id, (step1, step2) => step1.amount - step2.amount)
    );
    const warnStep: WarnStep = warnSteps.find(step => step.amount === warns.length + 1); // + 1 'cause we're boutta warn
    const reasonEmbed = new MessageEmbed();
    reasonEmbed
      .setColor("AQUA")
      .setDescription(reason || "None")
      .setTimestamp(new Date());
    const finish = () => {
      sentWarnMsg.edit(`Warned ${member.user.tag} successfully.`).catch(rejctF("[WARN-SUCCESSFUL-EDIT-MSG]"));
      actionLog({
        target: member,
        type: "w",
        author,
        guild,
        reason: reason || "None"
      }).catch(rejctF("[WARN-AUDITLOG]"));
    };
    const fail = err => {
      rejct(err ? (err.err || err) : err);
      sentWarnMsg.edit(`The warn failed! :frowning:`).catch(rejctF("[WARN-FAIL-EDIT-MSG]"));
    };
    const executeWarnAsync = async () => {
      try {
        await (db.table("warns").add(guild.id, {
          userid: compress(member.id),
          casenumber: (await (db.table("mods").prop(guild.id, "latestCase"))) + 1,
          reason: reason || "None",
          moderatorid: compress(author.id),
          warnedat: datecomp()
        }, true));
        if (warnStep) {
          const punishment = (Constants.maps.PUNISHMENTS[warnStep.punishment] || ["none"] as never)[0];
          const timeDur = durationdecompress(warnStep.time);
          const time: Interval = new Interval(timeDur || Time.minutes(10));
          if (punishment === "kick" || punishment === "ban" || punishment === "softban") {
            let reasonStr: string;
            const ableName = punishment === "kick" ? "kick" : "bann";
            if (member.roles.highest.position > botmember.roles.highest.position) {
              reasonStr = "that member's highest role is higher in position than mine!";
            } else if (member.roles.highest.position === botmember.roles.highest.position) {
              reasonStr = "that member's highest role is the same in position as mine!";
            } else if (member.id === guild.owner.id) {
              reasonStr = "that member is the owner!";
            } else if (!member[ableName + "able"]) {
              reasonStr = `that member is not ${ableName}able (being generic here). \
Check the conditions for being ${ableName}ed (e.g. must not be owner, etc)!`;
            }
            if (reasonStr) {
              return reply(`That member has reached a limit of ${warnStep.amount} warnings which implies \
a **${punishment}**, however I am not able to ${punishment} them because ${reasonStr}`);
            }
            sentWarnMsg.edit(`The member ${member} has reached a limit of ${warnStep.amount} warnings which implies \
a **${punishment}** (as says this server's current setup).`);
            if (punishment === "kick") {
              kickP.punish(member, {
                author, reason, auctPrefix, context
              });
            } else {
              banP.punish(member, guild, context, {
                author, reason, auctPrefix, usePrompt: false, days: 1, isSoft: punishment === "softban",
                actions: punishment === "softban" ?
                ["Softbanning", "Softbanned", "softbanned", "Softban", "softban"] :
                ["Banning", "Banned", "banned", "Ban", "ban"]
              });
            }
          } else if (/^p?mute/.test(punishment)) {
            const isPerm = /^p/i.test(punishment);
            const complText = isPerm ? "permanent mute" : `mute for **${time}**`;
            sentWarnMsg.edit(`The member ${member} has reached a limit of ${warnStep.amount} warnings which implies \
a ${complText}.`);
            muteP.punish(member, {
              author, reason, auctPrefix, context, time, permanent: isPerm
            });
          }
          if (warnStep.amount >= warnSteps.sort((a, b) => b.amount - a.amount)[0].amount) { // if reached highest amount
            const newWarns = await (db.table("warns").filterArr(guild.id, u => uncompress(u.userid) === member.id));
            for (const warn of newWarns) {// then D E L E T
              await db.table("warns").remArr(guild.id, warn, true);
            }
          }
        } else {
          finish();
        }
      } catch (err) {
        fail(err);
      }
    };
    const executeWarn = () => {
      executeWarnAsync().catch(err => { throw err; });
    };
    if (warnStep) {
      executeWarn();
    } else {
      let sent = false;
      let timeoutRan = false;
      member.send(
        `You were ${automatic ? "automatically " : ""}warned at the server **${escMarkdown(guild.name)}** for the \
reason of:`,
        { embed: reasonEmbed },
      ).then(() => {
        if (timeoutRan) {
          return;
        }
        sent = true;
        sentWarnMsg.edit(`Warning ${member.user.tag}... (DM Sent. Executing the warn...)`)
          .catch(rejctF("[WARN-DM SENT-EDIT-MSG]"));
        executeWarn();
      }).catch(err => {
        rejct(err);
        if (timeoutRan) {
          return;
        }
        sent = true;
        sentWarnMsg.edit(`Muting ${member.user.tag}... (DM Failed. Executing the warn anyways...)`)
          .catch(rejctF("[WARN-DM FAIL-EDIT-MSG]"));
        executeWarn();
      });
      setTimeout(() => {
        if (!sent) {
          timeoutRan = true;
          executeWarn();
        }
      }, Time.seconds(2.8));
    }
  }
}

export default new Warn();
