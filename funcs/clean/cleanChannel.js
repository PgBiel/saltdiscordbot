const { Constants: { ChannelTypes } } = require("discord.js");
const cleanUser = require("./cleanUser");

module.exports = function cleanChannel(channel, guildId = (channel.guild || {}).id) {
  if (channel == null || typeof channel !== "object") return channel;
  const {
    id, type: _type, name, rawPosition, parentID, permissionOverwrites, topic, nsfw, lastMessageID, bitrate, userLimit,
    recipient, recipients, icon, ownerID, managed, applicationID, nicks
  } = channel;
  const typeE = Object.entries(ChannelTypes);
  const type = typeE.find(([k, v]) => k === String(_type).replace(/\s/g, "_").toUpperCase())[1];
  const obj = {
    guild: guildId,
    id,
    type,
    name,
    position: rawPosition,
    parent_id: parentID,
    permission_overwrites: permissionOverwrites.map(
      po => ({ allow: po.allowed.bitfield, deny: po.denied.bitfield, type: po.type, id: po.id })
    )
  };
  if (["text", "dm", "group"].includes(_type)) {
    Object.assign(obj, { last_message_id: lastMessageID });
    if (_type === "text") {
      Object.assign(obj, { topic, nsfw });
    } else if (_type === "dm") {
      obj.recipients = [cleanUser(recipient)]; 
    } else if (_type === "group") {
      Object.assign(
        obj, 
        {
          recipients: recipients.map(u => cleanUser(u)),
          icon,
          owner_id: ownerID,
          managed,
          application_id: applicationID,
          nicks: nicks.map((nick, id) => ({ id, nick }))
        }
      );
    }
  } else if (_type === "voice") {
    Object.assign(obj, { bitrate, user_limit: userLimit });
  }
  return obj;
};