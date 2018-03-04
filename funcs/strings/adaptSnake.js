const capitalize = require("./capitalize");

module.exports = function adaptSnake(text, returnArr = false) {
  const arr = Array.isArray(text) ? text : text.split(/,\s+|\s+/);
  const newArr = [];
  for (const el of arr) {
    const genArr = [];
    const str = String(el);
    for (const mStr of str.split(/[_-\s]/)) {
      if (/^(VIP|MVP|UR[LI])$/i.test(mStr)) {
        genArr.push(mStr.toUpperCase());
      } else {
        genArr.push(capitalize(mStr, { lowerCase: true }));
      }
    }
    newArr.push(genArr.join(" "));
  }
  return returnArr ? newArr : newArr.join(", ");
};
