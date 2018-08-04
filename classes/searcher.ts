import {
  Collection, Guild, GuildChannel, GuildMember, GuildMemberRoleStore, Role, User, VoiceChannel, CategoryChannel
} from "discord.js";
import { _, bot, Constants, logger, TextChannel } from "../util/deps";
import { oneOrMany } from "../misc/tableValues";

// TypeScript Remainder

export type GuildResolvable = Guild | string;
export type SearchChannelType = "text" | "voice" | "category" | "all";
export type SearchChannelResult = TextChannel | VoiceChannel | CategoryChannel;

export interface ISearcherOptions<MemberColl> {
  guild?: Guild;
  members?: Collection<string, MemberColl> | MemberColl[];
  roles?: Collection<string, Role> | Role[];
  channels?: Collection<string, GuildChannel> | GuildChannel[];
}

/**
 * Utility class for searching for members,
 * channels, and roles.
 * @param MemberColl The type of member to look for
 */
export class Searcher<MemberColl = GuildMember> {
  // props:
  /**
   * The guild that this instance looks in.
   * @type {?Guild}
   */
  public guild?: Guild;

  /**
   * The member collection to look members in.
   * @type {Collection<string, MemberColl>}
   */
  public members: Collection<string, MemberColl>;

  /**
   * The channel collection to look channels in.
   * @type {Collection<string, GuildChannel>}
   */
  public channels: Collection<string, GuildChannel>;

  /**
   * The role collection to look roles in.
   * @type {Collection<string, Role>}
   */
  public roles: Collection<string, Role>;
  /**
   * @param {SearcherOptions} options The options
   */
  constructor(options: ISearcherOptions<MemberColl>) {
    const { guild, members, roles, channels } = options;
    if (guild) {
      this.guild = guild;
      this.roles = guild.roles;
      this.channels = guild.channels;
      this.members = (guild.members as any);
    }
    if (roles) {
      if (roles instanceof Array) {
        const rolesToUse = new Collection<string, Role>();
        for (const role of roles) {
          rolesToUse.set(role.id, role);
        }
        this.roles = rolesToUse;
      } else {
        this.roles = roles;
      }
    }
    if (channels) {
      if (channels instanceof Array) {
        const channelsToUse = new Collection<string, GuildChannel>();
        for (const channel of channels) {
          channelsToUse.set(channel.id, channel);
        }
        this.channels = channelsToUse;
      } else {
      this.channels = channels;
      }
    }
    if (members) {
      if (members instanceof Array) {
        const membersToUse = new Collection<string, MemberColl>();
        for (const member of members) {
          membersToUse.set(
            (member instanceof GuildMember || member instanceof User) ?
            member.id :
            member.toString(), member,
          );
        }
        this.members = membersToUse;
      } else {
        this.members = members;
      }
    }
  }

  /**
   * Search for a member.
   * @param {string|RegExp} nameOrPattern The name/nickname to look for or pattern to test for
   * @returns {Array<MemberColl>} The result(s)
   */
  public searchMember(nameOrPattern: string | RegExp): MemberColl[] {
    const pattern = nameOrPattern instanceof RegExp ?
      nameOrPattern :
      new RegExp(_.escapeRegExp(nameOrPattern), "i");
    const match: MemberColl[] = [];
    const getUser = (member: MemberColl): User => {
      const userToUse: User = member instanceof GuildMember ?
      member.user :
      member instanceof User ?
      member :
      null;

      return userToUse;
    };
    if (typeof nameOrPattern === "string" && Constants.regex.NAME_AND_DISCRIM.test(nameOrPattern)) {
      const result = this.members.find((memb: MemberColl) => getUser(memb).tag === nameOrPattern);
      if (result) {
        match.push(result);
        return match;
      }
    }
    for (const [id, member] of this.members) {
      const userToUse: User = getUser(member);
      if (
        (typeof nameOrPattern === "string" && userToUse.username === nameOrPattern)
        || (typeof nameOrPattern !== "string" && pattern.test(userToUse.username))
        ) {
        match.push(member);
      }
    }
    if (match.length < 1 && typeof nameOrPattern === "string") {
      for (const [id, member] of this.members) {
        const userToUse = getUser(member);
        if (pattern.test(userToUse.username)) {
          match.push(member);
        }
      }
    }
    // if (match.length < 1) {
    for (const [id, member] of this.members) {
      if (pattern.test(member instanceof GuildMember ? member.nickname : getUser(member).username)) {
        let shouldContinue: boolean = false;
        match.forEach((m: MemberColl) => {
          if (shouldContinue) {
            return;
          }
          if ((getUser(m) ? getUser(m).id : m) === (getUser(member) || { id: member }).id) {
            shouldContinue = true;
          }
        });
        if (shouldContinue) {
          continue;
        }
        match.push(member);
      }
    }
    // }
    if (match.length < 1 && typeof nameOrPattern === "string") {
      if (this.members.has(nameOrPattern)) {
        match.push(this.members.get(nameOrPattern));
      }
    }
    logger.debug(match.toString());
    return match;
  }

  /**
   * Search for a channel.
   * @param {string} nameOrPattern The channel name to search for or pattern to test for
   * @param {string[]|string} [type="text"] The channel type to look for. One of "text", "voice", "category", and "all"
   * @returns {Array<TextChannel|VoiceChannel|CategoryChannel>} The result(s)
   */
  public searchChannel(nameOrPattern: string | RegExp, type: "text"): TextChannel[];
  public searchChannel(nameOrPattern: string | RegExp, type: "voice"): VoiceChannel[];
  public searchChannel(nameOrPattern: string | RegExp, type: "category"): CategoryChannel[];
  public searchChannel(nameOrPattern: string | RegExp, type: oneOrMany<SearchChannelType>): SearchChannelResult[];
  public searchChannel(
    nameOrPattern: string | RegExp, type: oneOrMany<SearchChannelType>
  ): SearchChannelResult[] {
    const pattern: RegExp = nameOrPattern instanceof RegExp ?
      nameOrPattern :
      new RegExp(_.escapeRegExp(nameOrPattern), "i");
    const zeArr = _.castArray(type).map(s => String(s).toLowerCase());
    const filtered = (): Collection<string, SearchChannelResult> => {
      let coll: Collection<string, GuildChannel> = new Collection();
      if (zeArr.length < 1) {
        coll = this.channels;
      } else {
        coll = this.channels.filter(chan => zeArr.includes(chan.type));
      }
      return (coll as Collection<string, SearchChannelResult>); // :/
    };
    const toLook: Collection<string, SearchChannelResult> = filtered();
    if (toLook.size < 1) return [];
    const match: SearchChannelResult[] = [];
    for (const [id, channel] of toLook) {
      if (
        (typeof nameOrPattern === "string" && channel.name === nameOrPattern)
        || (typeof nameOrPattern !== "string" && pattern.test(channel.name))) {
        match.push(channel);
      }
    }
    if (match.length < 1 && typeof nameOrPattern === "string") {
      for (const [id, channel] of toLook) {
        if (pattern.test(channel.name)) {
          match.push(channel);
        }
      }
      if (match.length < 1 && toLook.has(nameOrPattern)) {
        match.push(toLook.get(nameOrPattern));
      }
    }
    return match; // jesus christ TS
  }

  /**
   * Search for a role.
   * @param {string|RegExp} nameOrPattern The name to look for or pattern to test for
   * @returns {Array<Role>} The result(s)
   */
  public searchRole(nameOrPattern: string | RegExp): Role[] {
    const pattern: RegExp = nameOrPattern instanceof RegExp ?
      nameOrPattern :
      new RegExp(_.escapeRegExp(nameOrPattern), "i");
    const match: Role[] = [];
    for (const [id, role] of this.roles) {
      if (pattern.test(role.name)) {
        match.push(role);
      }
    }
    if (match.length < 1 && typeof nameOrPattern === "string" && this.roles.has(nameOrPattern)) {
      match.push(this.roles.get(nameOrPattern));
    }
    return match;
  }
}

export default Searcher;
