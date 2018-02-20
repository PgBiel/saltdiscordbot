const { moment } = require("../../util/deps");
const uncompress = require("./uncompress");

/**
 * Decompresses a duration.
 * @param {string} comp Compressed string
 * @returns {Duration}
 */
module.exports = function durationdecompress (comp) {
  const str = uncompress(comp);
  return moment.duration({
    months: (str.match(/(\d+)a/) || "")[1],
    days: (str.match(/(\d+)b/) || "")[1],
    hours: (str.match(/(\d+)c/) || "")[1],
    minutes: (str.match(/(\d+)d/) || "")[1],
    seconds: (str.match(/(\d+)e/) || "")[1]
  });
};
