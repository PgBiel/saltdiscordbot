const cleanRole = require("./cleanRole");
const cleanChannel = require("./cleanChannel");
const cleanEmoji = require("./cleanEmoji");
const cleanPresence = require("./cleanPresence");
const cleanGuildMember = require("./cleanGuildMember");

module.exports = function cleanGuild(guild) {
  if (guild == null || typeof guild !== "object") return guild;
  const { available, id } = guild;
  const obj = {
    unavailable: !available,
    id
  };
  if (available) {
    const {
      name, icon, splash, region, memberCount, large, features, applicationID, afkTimeout, afkChannelID,
      systemChannelID, embedEnabled, verificationLevel, explicitContentFilter, joinedTimestamp, channels,
      roles, ownerID, emojis, voiceStates, members
    } = guild;
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
};
