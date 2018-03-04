const { Interval, moment } = require("../../util/deps");
const pluralize = require("../strings/pluralize");

/**
 * Amount of time between two dates
 * @param {Date} beforeDate Before
 * @param {Date} afterDate After
 * @returns {string}
 */
module.exports = function ago(beforeDate, afterDate, scale = false) {
  const diffe = new Interval(moment(afterDate).diff(moment(beforeDate)));
  if (scale) {
    let string = "";
    if (diffe.years || diffe.months || diffe.days) {
      const daysToUse = diffe.days + (diffe.hours > 11 ? 1 : 0);
      if (diffe.years) string += diffe.years + pluralize(" year", diffe.years);
      if (diffe.months) string += `${diffe.years ? (daysToUse ? ", " : " and ") : ""}${diffe.months} ${pluralize("month", diffe.months)}`;
      if (diffe.days) { 
        const hasBefore = diffe.months || diffe.years;
        string += `${hasBefore ? " and " : ""}${daysToUse} ${pluralize("day", daysToUse)}`;
        if (diffe.hours && !hasBefore) string += ` and ${diffe.hours} ${pluralize("hour", diffe.hours)}`;
      }
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
