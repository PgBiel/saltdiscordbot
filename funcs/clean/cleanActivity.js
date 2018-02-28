const { Constants: { ActivityTypes } } = require("discord.js");

module.exports = function cleanActivity(activity) {
  if (activity == null || typeof activity !== "object") return activity;
  const {
    type, name, url, details, state, applicationID, timestamps, party, assets, syncID, _flags
  } = activity;
  const typeK = Object.keys(ActivityTypes);

  return {
    type: typeK[typeK.indexOf(type)],
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