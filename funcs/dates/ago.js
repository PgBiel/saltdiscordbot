const { Interval, moment } = require("../../util/deps");

/**
 * Amount of time between two dates
 * @param {Date} beforeDate Before
 * @param {Date} afterDate After
 * @returns {string}
 */
module.exports = function ago(beforeDate, afterDate, upToDays = false) {
  const diffe = new Interval(moment(afterDate).diff(beforeDate));
  if (upToDays) {
    let string = "";
    if (diffe.years) string += diffe.years + " year" + (diffe.years > 1 ? "s" : "");
    if (diffe.months) string += `${diffe.years ? (diffe.days ? ", " : " and ") : ""}${diffe.months} month${diffe.months > 1 ? "s" : ""}`;
    if (diffe.days) string += `${(diffe.months || diffe.years) ? " and " : ""}${diffe.days} day${diffe.days > 1 ? "s" : ""}`;
    return string;
  } else {
    return diffe.toString();
  }
};
