const ncrequire = require("../funcs/util/ncrequire");

const basePath = "../../constants/files/";
const names = ["emoji", "images", "identifiers", "maps", "numbers", "strings", "times", "regex", "unused/sql"];
names.forEach(n => ncrequire(basePath + n, false));

exports.emoji = require("./files/emoji");
exports.images = require("./files/images");
exports.identifiers = require("./files/identifiers");
exports.maps = require("./files/maps");
exports.numbers = require("./files/numbers");
exports.strings = require("./files/strings");
exports.times = require("./files/times");
exports.regex = require("./files/regex");
exports.sql = require("./files/unused/sql");