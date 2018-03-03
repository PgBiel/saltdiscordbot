const { Constants, moment } = require("../../util/deps");
const defaultDFormat = Constants.strings.DATE_FORMAT;

/**
 * Format a date in UTC
 * @param {Date} date Date
 * @param {object} [options] Options
 * @param {string} [options.format=Constants.strings.DATE_FORMAT] Date format
 * @param {boolean} [options.addUTC=true] If should add "(UTC)" at the end
 * @returns {string} Formatted date
 */
module.exports = function momentUTC(date, { format = defaultDFormat, addUTC = true, UTCcommas = true } = {}) {
  return moment(date).utc().format(format) + (addUTC ? (UTCcommas ? ", UTC" : " (UTC)") : "");
};
