import cleanChannel, { ICleanChannel } from "./cleanChannel";
import cleanEmoji, { ICleanEmoji } from "./cleanEmoji";
import cleanGuildMember from "./cleanGuildMember";
import cleanPresence from "./cleanPresence";
import cleanRole from "./cleanRole";

import { Collection, Guild, GuildFeatures } from "discord.js";

export interface IVoiceState {
  guild_id?: string;
  channel_id: string;
  user_id: string;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  suppress: boolean;
}

export interface ICleanGuild {
  unavailable: boolean;
  id: string;

  // for available guilds
  name?: string;
  icon?: string;
  splash?: string;
  region?: string;
  member_count?: number;
  large?: boolean;
  features?: GuildFeatures[];
  application_id?: string;
  afk_timeout?: number;
  afk_channel_id?: string;
  system_channel_id?: string;
  embed_enabled?: boolean;
  verification_level?: number;
  explicit_content_filter?: number;
  joined_at?: number;
  owner_id?: string;
  channels?: ICleanChannel[];
  roles?: any[];
  emojis?: ICleanEmoji[];
  members?: any[];
  voice_states?: IVoiceState[];
}

export default function cleanGuild(guild: Guild): ICleanGuild {
  if (guild == null || typeof guild !== "object") return guild as never;
  const { available, id } = guild;
  const obj: ICleanGuild = {
    unavailable: !available,
    id
  };
  if (available) {
    const {
      name, icon, splash, region, memberCount, large, features, applicationID, afkTimeout, afkChannelID,
      systemChannelID, embedEnabled, verificationLevel, explicitContentFilter, joinedTimestamp, channels,
      roles, ownerID, emojis, members
    } = guild;
    const { voiceStates }: { voiceStates: Collection<string, IVoiceState> } = (guild as any); // not typed for some reason
    Object.assign(obj, {
      name,
      icon,
      splash,
      region,
      member_count: memberCount,
      large,
      features,
      application_id: applicationID,
      afk_timeout: afkTimeout,
      afk_channel_id: afkChannelID,
      system_channel_id: systemChannelID,
      embed_enabled: embedEnabled,
      verification_level: verificationLevel,
      explicit_content_filter: explicitContentFilter,
      joined_at: joinedTimestamp,
      owner_id: ownerID,

      channels: channels.map(c => cleanChannel(c, id)),
      roles: roles.map(r => cleanRole(r, id)),
      emojis: emojis.map(e => cleanEmoji(e, id)),
      members: members.map(m => cleanGuildMember(m, id)),
      voice_states: voiceStates ? voiceStates.array() : null
    });
  }
  return obj;
}
