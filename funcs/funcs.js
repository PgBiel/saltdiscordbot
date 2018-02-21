function applyFuncs() { // this is first to fix resolving issue
  Object.entries(module.exports).forEach(([k, v]) => this[k] = v);
}
exports.applyFuncs = applyFuncs;

const { klaw } = require("../util/deps");
const ncrequire = require("./util/ncrequire");

const files = klaw("./funcs", { nodir: true });
for (const file of files) {
  const filePath = file.path;
  if (/\.js$/i.test(filePath) && !/funcs\.\w+$/i.test(filePath)) {
    const exported = ncrequire(filePath);
    if (typeof exported === "function") {
      exports[filePath.match(/(\w+)\.js$/i)[1]] = exported;
    } else {
      const value = exported[Object.keys(exported)[0]];
      if (typeof value === "function") {
        exports[filePath.match(/(\w+)\.js$/i)[1]] = value;
      }
    }
  }
}
