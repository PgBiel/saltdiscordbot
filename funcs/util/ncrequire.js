/**
 * Require without being on cache
 * @param {string} fpath The path to require
 * @returns {*} The required value
 */
module.exports = function ncrequire(fpath) {
  delete require.cache[require.resolve(fpath)];
  return require(fpath);
};
