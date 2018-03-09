const _ = require("lodash");

module.exports = function followPath(obj, path) {
  if (typeof path === "string") path = _.toPath(path);
  return path.reduce((prev, curr) => typeof curr === "string" && curr ? prev[curr] : prev, obj);
};
