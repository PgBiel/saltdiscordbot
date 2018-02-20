const { _, Constants, Interval } = require("../../util/deps");
const invalidSymbol = Symbol("InvalidTime");
/**
 * Parse a time string. (Used for mute command)
 * @param {string} str The time string.
 * @returns {Object} The parsed time, with all units as a property.
 */
function parseTimeStr(str) {
  const time = new Interval();
  if (typeof str !== "string") {
    return Object.assign({}, time.units, { [invalidSymbol]: true });
  }
  const match = str.match(Constants.regex.MUTE.TIME_MATCH);
  if (!match || match.length < 1) {
    return Object.assign({}, time.units, { [invalidSymbol]: true });
  }
  for (const result of match) {
    const [amount, unit] = [
      _.trim(result).match(Constants.regex.MUTE.SINGLE_TIME_MATCH(true))[1],
      _.trim(result).match(Constants.regex.MUTE.SINGLE_TIME_MATCH(false))[1]
    ];
    if (Interval.validUnit(unit)) {
      time.add(unit, Number(amount));
    }
  }
  return Object.assign({}, time.units, { [invalidSymbol]: false });
}
parseTimeStr.invalid = invalidSymbol;

module.exports = parseTimeStr;