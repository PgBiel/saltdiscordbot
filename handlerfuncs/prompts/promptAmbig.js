const { _, capitalize, collectReact, Constants, Discord, logger, rejct, Searcher, TextChannel } = require("../../misc/d");
const sleep = require("../../funcs/util/sleep");
const rejctF = require("../../funcs/util/rejctF");
const _reply = require("../senders/reply");
const _send = require("../senders/send");

module.exports = msg => {
  const { channel } = msg;
  const { Collection, GuildChannel, Role, VoiceChannel } = Discord;
  /**
   * Prompt ambig
   * @param {Array<*>} subjectArr List of possibilities
   * @param {string} [pluralName="members"] Plural name
   * @param {object} [opts] Options
   * @param {string} [type="member"] Type (one of member, role, channel)
   * @param {boolean} [deletable=true] If should delete msgs
   * @param {string} [channelType="text"] Channel type (used only for channels, one of text, voice, category)
   * @returns {object} Result
   */
  return async (subjectArr, pluralName = "members", opts = { type: "member" }) => {
    let mode = "r";
    const isInGuild = Boolean(channel.guild);
    if (isInGuild && !channel.permissionsFor(channel.guild.me).has(["ADD_REACTIONS"])) mode = "m";
    const subjects = subjectArr.slice(0);
    subjects.splice(10, 2);
    const send = _send(msg);
    const reply = _reply(msg);
    let satisfied = false;
    let cancelled = false;
    let currentOptions = [];
    const msgs = [];
    const { type = "member", deletable = true, channelType = "text" } = opts;

    const getTag = gm => {
      if (gm instanceof TextChannel) {
        return `#${gm.name}`;
      } else if (gm instanceof VoiceChannel || gm instanceof Role) {
        return `${gm.name}`;
      } else if (gm.user) {
        return gm.user.tag;
      } else if (gm.tag) {
        return gm.tag;
      } else {
        return gm.toString();
      }
    };
    const canceller = Constants.emoji.rjt.CANCEL;
    subjects.forEach(gm => currentOptions.push(gm));
    const rFilter = (ret, coll, mssg) => {
      const re = coll[0];
      const str = re.emoji.id ? `<:${re.emoji.name}:${re.emoji.id}>` : re.emoji.name;
      const removeAll = async () => {
        if (mssg.guild && mssg.channel.permissionsFor(mssg.guild.me).has(["MANAGE_MESSAGES"])) {
          await mssg.reactions.removeAll();
        } else {
          for (const reacted of ret) {
            await sleep(150);
            await reacted.users.remove();
          }
        }
      };
      if (str === canceller) {
        cancelled = true;
        removeAll().catch(rejctF("[PROMPTAMBIG R-CANCEL RMV-ALL]"));
        return true;
      }
      if (!deletable) removeAll().catch(rejctF("[PROMPTAMBIG R-OK RMV-ALL]"));
      const options = currentOptions;
      const ind = Constants.emoji.numbers.indexOf(str);
      if (ind > -1) {
        satisfied = true;
        currentOptions = [options[ind - 1]];
        return true;
      }
      return false;
    };
    const mFilter =  msg2 => {
      const cont = msg2.content;
      const options = currentOptions;
      if (msg2.author.id !== msg.author.id) {
        return false;
      }
      if (cont === "cancel" || cont === "`cancel`") {
        cancelled = true;
        return true;
      }
      msgs.push(msg2);
      if (/^#\d+$/.test(cont)) {
        const nNumber = cont.match(/^#(\d+)$/)[1];
        if (nNumber.length < 5) {
          const number = Number(nNumber);
          if (number % 1 === 0 && number > 0 && number < 51 && number <= options.length) {
            satisfied = true;
            currentOptions = [options[Number(number) - 1]];
            return true;
          }
        }
      }
      const tagOptions = [];
      for (const gm of options) {
        if (gm instanceof Role || gm instanceof GuildChannel) {
          tagOptions.push(String(gm));
        } else {
          tagOptions.push(getTag(gm));
        }
      }
      if (tagOptions.includes(cont)) {
        satisfied = true;
        currentOptions = [options[tagOptions.indexOf(cont)]];
        return true;
      }
      const collOptions = new Collection();
      options.forEach(gm => {
        collOptions.set(gm.id || gm.toString(), gm);
      });
      const searcher2 = new Searcher({ [type + "s"]: collOptions });
      const resultingMembers = type === "channel" ?
        searcher2.searchChannel(cont.replace(/^#/, ""), channelType || "text") :
        (type === "role" ?
          searcher2.searchRole(cont) :
          searcher2.searchMember(cont)
        );
      if (resultingMembers.length < 1) {
        return true;
      }
      if (resultingMembers.length > 1) {
        currentOptions = resultingMembers;
        return true;
      }
      satisfied = true;
      currentOptions = resultingMembers;
      return true;
    };
    const sendIt = async () => {
      const endText = mode.startsWith("m") ?
        "Please specify one, or a number preceded by `#` (e.g. `#1`). This command will automatically cancel \
after 25 seconds. Type `cancel` to cancel." :
        `Please react with one of the numbers, or ${canceller} to cancel. This command will automatically cancel after \
25 seconds.`;
      const mssg = await reply(`Multiple ${pluralName} have matched that search. ${endText}
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `#${i + 1}: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`, { autoCatch: false });
      msgs.push(mssg);
      return mssg;
    };
    let obj = { cancelled: 1 };
    for (let i = 0; i < (mode === "r" ? 1 : Constants.numbers.max.PROMPT); i++) {
      try {
        if (mode === "r") {
          const emojis = [
            Constants.emoji.resolved.rjt.CANCEL
          ];
          for (let i = 1; i <= currentOptions.length; i++) emojis.push(Constants.emoji.numbers[i]);
          const { reason, results: ret, collected: coll, msg: mssg } = await collectReact(
            await sendIt(),
            emojis,
            msg.author.id,
            { onSuccess: _.identity, timeout: Constants.times.AMBIGUITY_EXPIRE, rawReact: true }
          );
          if (reason === "time") throw "no u";
          rFilter(ret, coll.array(), mssg);
        } else /* if (mode === "m") */ {
          await sendIt();
          await channel.awaitMessages(
            mFilter, {
              time: Constants.times.AMBIGUITY_EXPIRE, max: 1,
              errors: ["time"]
            },
          );
        }
        if (satisfied) {
          obj = {
            subject: currentOptions[0],
            cancelled: false
          };
          break;
        }
        if (cancelled) {
          send("Command cancelled.");
          obj = {
            subject: null,
            cancelled: true
          };
          break;
        }
      } catch (err) {
        if (err !== "no u") logger.error(`At PromptAmbig: ${err}`);
        cancelled = true;
        send("Command cancelled.");
        obj = {
          subject: null,
          cancelled: true
        };
        break;
      }
    }
    if (obj.cancelled === 1) {
      send("Automatically cancelled command.");
      return { subject: null, cancelled: true };
    }
    const cMsgs = _.compact(msgs);
    if (
      isInGuild && cMsgs.length && deletable && channel.permissionsFor(channel.guild.me).has(["MANAGE_MESSAGES"]) &&
      !cancelled
    ) {
      channel.bulkDelete(msgs)
        .catch(err => rejct(err, "[PROMPTAMBIG-BULKDEL]"));
    }
    return obj;
  };
};
