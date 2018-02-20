/**
 * Sleep.
 * @param {number} [ms=10000] Milliseconds to sleep
 * @returns {Promise<void>} Done!
 */
module.exports = function sleep (ms = 10000) {
  return new Promise(res => setTimeout(res, ms));
};
