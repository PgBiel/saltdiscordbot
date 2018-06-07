/**
 * Require without being on cache
 * @param {string} fpath The path to require
 * @param {boolean} [actualRequire=true] If should actually require or just erase from cache;
 * @returns {*} The required value
 */
export default function ncrequire(fpath: string, actualRequire = true) {
  delete require.cache[require.resolve(fpath)];
  return actualRequire ? require(fpath) : null;
}
