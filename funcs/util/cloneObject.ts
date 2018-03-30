/**
 * Clone an object.
 * @param {*} objec The object.
 * @returns {*} The cloned object.
 */
export default function cloneObject<T extends object>(objec: T) {
  return Object.assign<T, T>(Object.create(objec), objec);
}
