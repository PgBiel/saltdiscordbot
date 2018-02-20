const { Constants, Interval, xreg } = require("../../util/deps");
const parseTimeStr = require("./parseTimeStr");
/**
 * Parse arguments for the mute command.
 * @param {string} str The arguments.
 * @returns {Object} The result.
 */
module.exports = function parseMute(str) {
  const obj = {
    ok: true,
    user: "",
    time: null,
    reason: ""
  };
  const reg = xreg(Constants.regex.MUTE.MATCH_REG, "xi");
  const results = str.match(reg);
  if (!results) {
    obj.ok = false;
    return obj;
  }
  results.forEach((piece, index) => {
    if (index < 1 || index > 7 || !piece) { return; }
    if (!obj.user) {
      obj.user = piece;
    } else if (!obj.time || obj.time.time < 1) {
      if (!obj.time) {
        obj.time = new Interval();
      }
      if (Constants.regex.MUTE.IS_JUST_NUMBER.test(piece)) {
        obj.time.add("m", Number(piece));
        return;
      }
      const parsedTime = parseTimeStr(piece);
      for (const [unit, amount] of Object.entries(parsedTime)) {
        if (Interval.validUnit(unit)) {
          obj.time.add(unit, amount);
        }
      }
    }
  });
  obj.reason = results[10] || "";
  return obj;
};
