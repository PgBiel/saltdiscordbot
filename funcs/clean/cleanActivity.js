const { Constants: { ActivityTypes } } = require("discord.js");

module.exports = function cleanActivity(activity) {
  if (activity == null || typeof activity !== "object") return activity;
  const {
    type: _type, name, url, details, state, applicationID, timestamps, party, assets, syncID, _flags
  } = activity;
  const typeV = Object.values(ActivityTypes);
  const type = typeV.findIndex(v => v === String(_type).replace(/\s/g, "_").toUpperCase());

  return {
    type,
    name,
    url,
    details,
    state,
    application_id: applicationID,
    timestamps: timestamps && timestamps.start && timestamps.end ?
      { start: timestamps.start.getTime(), end: timestamps.end.getTime() } :
      null,
    party,
    assets: assets ? {
      large_text: assets.largeText,
      small_text: assets.smallText,
      large_image: assets.largeImage,
      small_image: assets.smallImage
    } : null,
    sync_id: syncID,
    flags: _flags
  };
};