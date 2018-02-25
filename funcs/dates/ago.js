const { Interval, moment } = require("../../util/deps");

/**
 * Amount of time between two dates
 * @param {Date} beforeDate Before
 * @param {Date} afterDate After
 * @returns {string}
 */
module.exports = function ago(beforeDate, afterDate) {
  return new Interval(moment(afterDate).diff(beforeDate)).toString();
};
