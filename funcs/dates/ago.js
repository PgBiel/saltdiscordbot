const { Interval, moment } = require("../../util/deps");
const pluralize = require("../strings/pluralize");

/**
 * Amount of time between two dates
 * @param {Date} beforeDate Before
 * @param {Date} afterDate After
 * @returns {string}
 */
module.exports = function ago(beforeDate, afterDate, scale = false) {
  const diffe = new Interval(moment(afterDate).diff(beforeDate));
  if (scale) {
    let string = "";
    if (diffe.days) {
      if (diffe.years) string += diffe.years + pluralize(" year", diffe.years);
      if (diffe.months) string += `${diffe.years ? (diffe.days ? ", " : " and ") : ""}${diffe.months} ${pluralize("month", diffe.months)}`;
      string += `${(diffe.months || diffe.years) ? " and " : ""}${diffe.days} ${pluralize("day", diffe.days)}`;
    } else if (diffe.hours || diffe.minutes) {
      if (diffe.hours) string += diffe.hours + pluralize(" hour", diffe.hours);
      if (diffe.minutes) string += `${diffe.hours ? " and " : ""}${diffe.minutes} ${pluralize("minute", diffe.minutes)}`;
    } else if (diffe.seconds) {
      string += diffe.seconds + pluralize(" second", diffe.seconds);
    }
    return string;
  } else {
    return diffe.toString();
  }
};
