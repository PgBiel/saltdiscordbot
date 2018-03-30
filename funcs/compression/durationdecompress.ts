import { moment } from "../../util/deps";
import uncompress from "./uncompress";

/**
 * Decompresses a duration.
 * @param {string} comp Compressed string
 * @returns {Duration}
 */
export default function durationdecompress(comp: string): moment.Duration {
  const str = uncompress(comp);
  return moment.duration({
    months: Number((str.match(/(\d+)a/) || "")[1]),
    days: Number((str.match(/(\d+)b/) || "")[1]),
    hours: Number((str.match(/(\d+)c/) || "")[1]),
    minutes: Number((str.match(/(\d+)d/) || "")[1]),
    seconds: Number((str.match(/(\d+)e/) || "")[1])
  });
}
