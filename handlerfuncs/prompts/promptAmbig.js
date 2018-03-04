const { capitalize, Constants, Discord, logger, rejct, Searcher, TextChannel } = require("../../misc/d");
const _reply = require("../senders/reply");
const _send = require("../senders/send");

module.exports = msg => {
  const { channel } = msg;
  const { Collection, GuildChannel, Role, VoiceChannel } = Discord;
  /**
   * Prompt ambig
   * @param {Array<*>} subjects List of possibilities
   * @param {string} [pluralName="members"] Plural name
   * @param {object} [opts] Options
   * @param {string} [type="member"] Type (one of member, role, channel)
   * @param {boolean} [deletable=true] If should delete msgs
   * @param {string} [channelType="text"] Channel type (used only for channels, one of text, voice, category)
   * @returns {object} Result
   */
  return async (subjects, pluralName = "members", opts = { type: "member" }) => {
    const send = _send(msg);
    const reply = _reply(msg);
    let satisfied = false;
    let cancelled = false;
    let currentOptions = [];
    const msgs = [];
    const { type = "member", deletable = true, channelType = "text" } = opts;
    console.log("D", deletable);

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

    subjects.forEach(gm => currentOptions.push(gm));
    const filter = msg2 => {
      const cont = msg2.content;
      const options = currentOptions;
      if (msg2.author.id !== msg.author.id) {
        return false;
      }
      if (cont === "cancel" || cont === "`cancel`") {
        cancelled = true;
        return true;
      }
      logger.debug("PUSH MSG2");
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
    msgs.push(
      await reply(`Multiple ${pluralName} have matched that search. Please specify one, or a number preceded by \`#\` \
(e.g. \`#1\`). This command will automatically cancel after 25 seconds. Type \`cancel\` to cancel.
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `\`#${i + 1}\`: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`, { autoCatch: false })
    );
    let obj = { cancelled: 1 };
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const result = await channel.awaitMessages(
          filter, {
            time: Constants.times.AMBIGUITY_EXPIRE, max: 1,
            errors: ["time"]
          },
        );
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
        if (i < 5) {
          msgs.push(
            await reply(`Multiple ${pluralName} have matched that search. Please specify one. Please specify one, \
or a number preceded by \`#\` (e.g. \`#1\`). This command will automatically cancel after 25 seconds. Type \`cancel\` \
to cancel.
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `\`#${i + 1}\`: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`, { autoCatch: false })
          );
        }
      } catch (err) {
        // logger.error(`At PromptAmbig: ${err}`);
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
    if (msgs.length > 1 && deletable && !cancelled) {
      channel.bulkDelete(msgs)
        .catch(err => rejct(err, "[PROMPTAMBIG-BULKDEL]"));
    }
    return obj;
  };
};
