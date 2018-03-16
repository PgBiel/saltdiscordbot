module.exports = function toTick(str, isG = true) {
  return str.replace(isG ? /`/g : /`/, "'");
};
