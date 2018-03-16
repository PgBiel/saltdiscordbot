module.exports = function no2Tick(str, isG = true) {
  return str.replace(isG ? /``/g : /``/, "`\u200B`");
};
