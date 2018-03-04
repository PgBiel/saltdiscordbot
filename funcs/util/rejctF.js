const rejct = require("./rejct");

module.exports = function rejctF(prefix) { return e => rejct(e, prefix); }