const { _, klaw, ncrequire } = require("../misc/d");

const files = klaw("./handlerfuncs", { nodir: true });
const obj = {};
for (const file of files) {
  const filePath = file.path;
  if (!/^proto|commandHandlerFuncs\.\w+$/i.test(filePath) && /\.js$/i.test(filePath)) {
    const exported = ncrequire(filePath);
    if (typeof exported === "function") {
      obj[filePath.match(/(\w+)\.js$/i)[1]] = exported;
    } else {
      const value = exported[Object.keys(exported)[0]];
      if (typeof value === "function") {
        obj[filePath.match(/(\w+)\.js$/i)[1]] = value;
      }
    }
  }
}
const func = (msg, isDoEval = false) => _.fromPairs(
  Object.entries(obj).map(([k, factory]) => isDoEval && /^doEval$/i.test(k) ? [] : [k, factory(msg)])
);
func.funcs = obj;
module.exports = func;