const { Interval, moment } = require("../../util/deps");

/**
 * Amount of time between two dates
 * @param {Date} beforeDate Before
 * @param {Date} afterDate After
 * @returns {string}
 */
module.exports = function ago(beforeDate, afterDate, scale = false) {
  const diffe = new Interval(moment(afterDate).diff(moment(beforeDate)));
  return diffe.toString(scale);
};
