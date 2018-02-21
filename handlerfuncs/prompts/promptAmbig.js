const { capitalize, Constants, Discord, logger, Searcher, TextChannel } = require("../../misc/d");
const reply = require("../senders/reply");
const send = require("../senders/send");

module.exports = msg => {
  const { channel } = msg;
  const { Collection, GuildChannel, Role, VoiceChannel } = Discord;
  return async (subjects, pluralName = "members", opts = { type: "member" }) => {
    let satisfied = false;
    let cancelled = false;
    let currentOptions = [];
    const { type, channelType = "text" } = opts;

    const getTag = gm => {
      if (gm instanceof TextChannel) {
        return `#${gm.name}`;
      } else if (gm instanceof VoiceChannel) {
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
    reply(`Multiple ${pluralName} have matched that search. Please specify one, or a number preceded by \`#\` (e.g. \`#1\`).
This command will automatically cancel after 25 seconds. Type \`cancel\` to cancel.
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `\`#${i + 1}\`: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`);
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const result = await channel.awaitMessages(
          filter, {
            time: Constants.times.AMBIGUITY_EXPIRE, max: 1,
            errors: ["time"]
          },
        );
        if (satisfied) {
          return {
            subject: currentOptions[0],
            cancelled: false
          };
        }
        if (cancelled) {
          send("Command cancelled.");
          return {
            subject: null,
            cancelled: true
          };
        }
        if (i < 5) {
          reply(`Multiple ${pluralName} have matched that search. Please specify one. Please specify one, or a number preceded by \`#\` (e.g. \`#1\`).
This command will automatically cancel after 25 seconds. Type \`cancel\` to cancel.
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `\`#${i + 1}\`: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`);
        }
      } catch (err) {
        logger.error(`At PromptAmbig: ${err}`);
        send("Command cancelled.");
        return {
          subject: null,
          cancelled: true
        };
      }
    }
    send("Automatically cancelled command.");
    return {
      subject: null,
      cancelled: true
    };
  };
};
