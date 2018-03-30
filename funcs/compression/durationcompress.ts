import { moment, Interval } from "../../util/deps";
import compress from "./compress";

/**
 * Compress a duration.
 * @param {string|Duration|Interval} dur Duration to compress
 * @returns {string}
 */
export default function durationcompress(dur: moment.DurationInputArg1 | Interval): string {
  let mo: moment.Duration;
  if (dur instanceof Interval) {
    mo = dur.duration;
  } else {
    mo = moment.duration(dur);
  }
  const temp = mo.hours();
  mo.subtract(Math.floor(temp / 24) * 24, "hours");
  mo.add(Math.floor(temp / 24), "days");
  const stuff = [mo.months() + mo.years() * 12, mo.days(), mo.hours(), mo.minutes(), mo.seconds()];
  const symbols = "abcde".split(``);
  return compress(stuff.map((v, i) => v ? v + symbols[i] : "").join(``));
}
