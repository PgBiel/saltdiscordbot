import {
  _, capitalize, collectReact, Message, Constants, Discord, logger, rejct, Searcher
} from "../../misc/d";
import sleep from "../../funcs/util/sleep";
import rejctF from "../../funcs/util/rejctF";
import _reply from "../senders/reply";
import _send from "../senders/send";
import { ICollectReactFunc } from "../../funcs/bot/collectReact";
import { SearchChannelResult } from "../../classes/searcher";
import {
  TextChannel, Role, GuildMember, GuildChannel, User, VoiceChannel, CategoryChannel, GuildEmoji
} from "discord.js";

export interface IPromptAmbigResult<S extends PromptAmbigSubject> {
  /**
   * Found subject
   */
  subject?: S;
  /**
   * If it was cancelled
   */
  cancelled: boolean;
}

export interface IPromptAmbigOpts {
  type?: "member" | "channel" | "role" | "emoji";
  deletable?: boolean;
  channelType?: "text" | "voice" | "category" | "all";
}

type InGuildChannel = TextChannel | VoiceChannel | CategoryChannel | GuildChannel;

export type PromptAmbigSubject = Role | GuildMember | GuildEmoji | InGuildChannel;

export default (msg: Message) => {
  const { channel } = msg;
  const { Collection, GuildChannel, Role, VoiceChannel } = Discord;
  /**
   * Prompt ambig
   * @param {Array<*>} subjectArr List of possibilities
   * @param {string} [pluralName="members"] Plural name
   * @param {object} [opts] Options
   * @param {string} [type="member"] Type (one of member, role, channel, emoji)
   * @param {boolean} [deletable=true] If should delete msgs
   * @param {string} [channelType="text"] Channel type (used only for channels, one of text, voice, category)
   * @returns {object} Result
   */
  async function promptAmbig<C extends Role>( // overload 1
    subjectArr: C[], pluralName: string, opts: IPromptAmbigOpts & { type: "role" }
  ): Promise<IPromptAmbigResult<C>>;
  async function promptAmbig<C extends GuildMember>( // ovl 2
    subjectArr: C[], pluralName: string, opts: IPromptAmbigOpts & { type: "member" }
  ): Promise<IPromptAmbigResult<C>>;
  async function promptAmbig<C extends GuildEmoji>( // ovl 3
    subjectArr: C[], pluralName: string, opts: IPromptAmbigOpts & { type: "emoji" }
  ): Promise<IPromptAmbigResult<C>>;
  async function promptAmbig<C extends InGuildChannel>( // ovl 4
    subjectArr: C[], pluralName: string, opts: IPromptAmbigOpts & { type: "channel" }
  ): Promise<IPromptAmbigResult<C>>;
  async function promptAmbig<C extends PromptAmbigSubject = PromptAmbigSubject>( // main as ovl
    subjectArr: C[], pluralName: string, opts: IPromptAmbigOpts
  ): Promise<IPromptAmbigResult<C>>
  async function promptAmbig<C extends PromptAmbigSubject>( // main
    subjectArr: PromptAmbigSubject[], pluralName: string = "members", opts: IPromptAmbigOpts = { type: "member" }
  ): Promise<IPromptAmbigResult<PromptAmbigSubject>> {
    let mode = "r";
    const isInGuild = (chan = channel): chan is TextChannel => chan instanceof TextChannel;
    // workaround to typings
    if (isInGuild(channel) && !channel.permissionsFor(channel.guild.me).has(["ADD_REACTIONS"])) mode = "m";
    const subjects = subjectArr.slice(0);
    subjects.splice(10, 2);
    const send = _send(msg);
    const reply = _reply(msg);
    let satisfied = false;
    let cancelled = false;
    let currentOptions: typeof subjectArr = [];
    const msgs: Message[] = [];
    const { type = "member", deletable = true, channelType = "text" } = opts;

    const getTag = (gm: PromptAmbigSubject) => {
      if (gm instanceof TextChannel) {
        return `\`#${gm.name.replace(/`/g, "'")}\``;
      } else if (gm instanceof GuildChannel || gm instanceof Role) {
        return `\`${gm.name.replace(/`/g, "'")}\``;
      } else if (gm instanceof GuildMember) {
        return "`" + gm.user.tag.replace(/`/g, "'") + "`";
      } else if (gm instanceof User) {
        return "`" + gm.tag.replace(/`/g, "'") + "`";
      } else {
        return gm.toString();
      }
    };
    const canceller: string = Constants.emoji.rjt.CANCEL;
    subjects.forEach(gm => currentOptions.push(gm));
    /**
     * Filter if reaction mode
     * @param ret Reaction list
     * @param coll Collected reaction
     * @param mssg Sent message
     */
    const rFilter: ICollectReactFunc = (ret, coll, mssg) => {
      const re = coll[0];
      const str = re.emoji.id ? `<:${re.emoji.name}:${re.emoji.id}>` : re.emoji.name;
      const removeAll = async () => {
        if (mssg.channel instanceof TextChannel && mssg.channel.permissionsFor(mssg.guild.me).has(["MANAGE_MESSAGES"])) {
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
    /**
     * Filter if message mode
     * @param msg2 Collected message
     */
    const mFilter = (msg2: Message) => {
      const cont: string = msg2.content;
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
          // if they specified an integer over 1 and under 51 and that number is valid index (in 1-indexed)
          if (number % 1 === 0 && number > 0 && number < 51 && number <= options.length) {
            satisfied = true;
            currentOptions = [options[Number(number) - 1]];
            return true;
          }
        }
      }
      const tagOptions: string[] = [];
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
      const collOptions = new Collection<string, PromptAmbigSubject>();
      options.forEach(gm => {
        collOptions.set(gm.id || gm.toString(), gm);
      });
      const searcher2 = new Searcher({ [type + "s"]: collOptions });
      let resultingMembers: PromptAmbigSubject[];
      if (type === "channel") {
        resultingMembers = searcher2.searchChannel(cont.replace(/^#/, ""), (channelType || "text" as any)); // sike
      } else if (type === "role") {
        resultingMembers = searcher2.searchRole(cont);
      } else {
        resultingMembers = searcher2.searchMember(cont);
      }
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
${currentOptions.map((gm, i) => `#${i + 1}: ${getTag(gm)}`).join(", ")}`, { autoCatch: false });
      msgs.push(mssg);
      return mssg;
    };
    let obj: IPromptAmbigResult<PromptAmbigSubject> = { cancelled: false };
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
          if (reason === "time") throw new Error("no u");
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
        cancelled = true;
        send("Command cancelled.");
        obj = {
          subject: null,
          cancelled: true
        };
        break;
      }
    }
    if (!cancelled && !satisfied) {
      send("Automatically cancelled command.");
      return { subject: null, cancelled: true };
    }
    const cMsgs = _.compact(msgs);
    if (
      isInGuild(channel) && cMsgs.length && deletable &&
      channel.permissionsFor(channel.guild.me).has(["MANAGE_MESSAGES"]) && !cancelled
    ) {
      channel.bulkDelete(msgs)
        .catch(err => rejct(err, "[PROMPTAMBIG-BULKDEL]"));
    }
    return obj;
  }
  return promptAmbig;
};
