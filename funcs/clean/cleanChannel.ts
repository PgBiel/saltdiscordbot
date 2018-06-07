import * as Discord from "discord.js";

export const ChannelTypes = {
  TEXT: 0,
  DM: 1,
  VOICE: 2,
  GROUP: 3,
  CATEGORY: 4,
};
import cleanUser, { ICleanUser } from "./cleanUser";

/**
 * Clean Channel
 */
export interface ICleanChannel {
  guildId?: string;
  id: string; // id
  type: number; // a type

  // for GuildChannels, GroupDMChannels
  name?: string;

  // for text
  last_message_id?: string;

  // for GuildChannels
  position?: number;
  parent_id?: string; // under category this is the category's id
  permission_overwrites?: Array<{
    allow: number; deny: number; type: Discord.OverwriteType; id: string;
  }>;

  // for GroupDMChannels and DMChannels
  recipients?: ICleanUser[];

  // for GroupDMChannels
  icon?: string;
  owner_id?: string;
  managed?: boolean;
  application_id?: string;
  nicks?: Array<{
      id: string;
      nick: string;
  }>;
}

function isInTextOrGroup(chan): chan is Discord.TextChannel | Discord.GroupDMChannel {
  return chan instanceof Discord.TextChannel || chan instanceof Discord.GroupDMChannel;
}
function hasName(chan): chan is Discord.TextChannel | Discord.GroupDMChannel | Discord.VoiceChannel {
  return chan instanceof Discord.VoiceChannel || isInTextOrGroup(chan);
}

export default function cleanChannel(
  channel: Discord.Channel, guildId: string = ((channel as any).guild || {}).id
): ICleanChannel {
  if (channel == null || typeof channel !== "object") return channel as never;
  const {
    id, type,
  } = channel;
  const typeE = Object.entries(ChannelTypes);
  const typeVar = typeE.find(([k, v]) => k === String(type).replace(/\s/g, "_").toUpperCase())[1];
  const obj: ICleanChannel = {
    guildId,
    id,
    type: typeVar
  };
  if (hasName(channel)) {
    obj.name = channel.name;
  }
  if (channel instanceof Discord.GuildChannel) {
    const { rawPosition, parentID, permissionOverwrites } = channel;
    Object.assign(obj, {
      position: rawPosition,
      parent_id: parentID,
      permission_overwrites: permissionOverwrites.map(
        (po) => ({ allow: po.allowed.bitfield, deny: po.denied.bitfield, type: po.type, id: po.id })
      )
    });
  }
  if (
    channel instanceof Discord.DMChannel ||
    isInTextOrGroup(channel)
  ) {
    Object.assign(obj, { last_message_id: channel.lastMessageID });
    if (channel instanceof Discord.TextChannel) {
      const { topic, nsfw } = channel;
      Object.assign(obj, { topic, nsfw });
    } else if (channel instanceof Discord.DMChannel) {
      obj.recipients = [cleanUser(channel.recipient)];
    } else if (channel instanceof Discord.GroupDMChannel) {
      const { recipients, icon, ownerID, managed, applicationID, nicks } = channel;
      Object.assign(
        obj,
        {
          recipients: recipients.map((u) => cleanUser(u)),
          icon,
          owner_id: ownerID,
          managed,
          application_id: applicationID,
          nicks: nicks.map((nick, id) => ({ id, nick }))
        },
      );
    }
  } else if (channel instanceof Discord.VoiceChannel) {
    const { bitrate, userLimit } = channel;
    Object.assign(obj, { bitrate, user_limit: userLimit });
  }
  return obj;
}
