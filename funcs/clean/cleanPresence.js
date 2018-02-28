const cleanActivity = require("./cleanActivity");

module.exports = function cleanPresence(presence) {
  if (presence == null || typeof presence !== "object") return presence;
  const { status, activity } = presence;
  return {
    status,
    activity: cleanActivity(activity)
  };
};
