const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/**
 * Compress a Date
 * @param {Date} [num=Date.now()] Date to compress
 * @returns {string} Compressed date
 */
export default function datecomp(num: string | number | Date = Date.now()): string {
  const curTime = new Date(num).toUTCString().split(` `);
  curTime.shift();
  const day: string = Number(curTime.shift()).toString(32);
  const month: string = months.indexOf(curTime.shift()).toString(13);
  const year: string = (Number(curTime.shift()) - 2018).toString(36);

  const rest: string[] = curTime.shift().split(`:`);

  const hour: string = Number(rest.shift()).toString(24);
  const minute: string = Number(rest.shift()).toString(36);

  return day + month + year + hour + minute;
}
