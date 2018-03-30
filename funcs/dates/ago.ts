import { Interval, moment } from "../../util/deps";

/**
 * Amount of time between two dates
 * @param {Date} beforeDate Before
 * @param {Date} afterDate After
 * @returns {string}
 */
export default function ago(
  beforeDate: moment.MomentInput, afterDate: moment.MomentInput, scale: boolean = false
) {
  const diffe = new Interval(moment(afterDate).diff(moment(beforeDate)));
  return diffe.toString(scale);
}
