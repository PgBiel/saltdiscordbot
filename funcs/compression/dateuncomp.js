/**
 * Uncompress a compressed Date
 * @param {string} str The compressed date
 * @returns {Date} Uncompressed date
 */
module.exports = function dateuncomp(str) {
  var ret = new Date(0);
  var stuff = str.split``;
  ret.setUTCDate(parseInt(stuff.shift(), 32));
  ret.setUTCMonth(parseInt(stuff.shift(), 13));
  ret.setUTCFullYear(parseInt(stuff.shift(), 36) + 2018);
  ret.setUTCHours(parseInt(stuff.shift(), 24), parseInt(stuff.join``, 36));
  return ret;
};
