/**
 * Clone an object.
 * @param {*} objec The object.
 * @returns {*} The cloned object.
 */
module.exports = function cloneObject (objec) {
  return Object.assign(Object.create(objec), objec);
};
