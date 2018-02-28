const { bot, Discord: { Activity } } = require("../../util/deps");

module.exports = function uncleanActivity(activity, presence) {
  if (activity == null || typeof activity !== "object") return activity;
  return new Activity(presence, activity);
};
