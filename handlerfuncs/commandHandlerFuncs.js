const { _, klaw, ncrequire } = require("../misc/d");

const files = klaw(".", { nodir: true });
const obj = {};
for (const file of files) {
  const filePath = file.path;
  if (!/^proto|commandHandlerFuncs\.\w+$/i.test(filePath) && /\.js$/i.test(filePath)) {
    const exported = ncrequire(filePath);
    if (typeof exported === "function") {
      obj[filePath.replace(/\.js$/i, "")] = exported;
    } else {
      const value = exported[Object.keys(exported)[0]];
      if (typeof value === "function") {
        obj[filePath.replace(/\.js$/i, "")] = value;
      }
    }
  }
}
const func = msg => _.fromPairs(Object.entries(obj).map(([k, factory]) => [k, factory(msg)]));
func.funcs = obj;
return func;