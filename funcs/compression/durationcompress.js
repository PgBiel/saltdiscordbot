const { moment, Interval } = require("../../util/deps");
const compress = require("./compress");

/**
 * Compress a duration.
 * @param {string|Duration|Interval} dur Duration to compress
 * @returns {string}
 */
module.exports = function durationcompress (dur) {
  let mo;
  if (dur instanceof Interval) {
    mo = dur.duration;
  } else {
    dur = String(dur);
    mo = moment.duration(dur);
  }
  const temp = mo.hours();
  mo.subtract(Math.floor(temp / 24) * 24, "hours");
  mo.add(Math.floor(temp / 24), "days");
  const stuff = [mo.months() + mo.years() * 12, mo.days(), mo.hours(), mo.minutes(), mo.seconds()];
  const symbols = "abcde".split``;
  return compress(stuff.map((v, i) => v ? v + symbols[i] : "").join``);
};
