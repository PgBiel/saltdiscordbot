function applyFuncs() { // this is first to fix resolving issue
  Object.entries(module.exports).forEach(([k, v]) => this[k] = v);
}
exports.applyFuncs = applyFuncs;

const { klaw } = require("./deps");
const ncrequire = require("./util/ncrequire");

const files = klaw(".", { nodir: true });
for (const file of files) {
  const filePath = file.path;
  if (!/funcs\.\w+$/i.test(filePath) && /\.js$/i.test(filePath)) {
    const exported = ncrequire(filePath);
    if (typeof exported === "function") {
      exports[filePath.replace(/\.js$/i, "")] = exported;
    } else {
      const value = exported[Object.keys(exported)[0]];
      if (typeof value === "function") {
        exports[filePath.replace(/\.js$/i, "")] = value;
      }
    }
  }
}