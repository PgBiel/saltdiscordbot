/**
 * Sleep.
 * @param {number} [ms=10000] Milliseconds to sleep
 * @returns {Promise<void>} Done!
 */
export default function sleep(ms: number = 10000): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}
