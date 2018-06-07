import { Command, klaw } from "../util/deps";
import { ncrequire } from "../funcs/funcs";

export const commands: {[name: string]: Command} = {};
const options = { nodir: true };
const files = klaw("./commands", options);
for (const file of files) {
  const filePath = file.path;
  if (!/cmdIndex\.\w+$/i.test(filePath) && /\.js$/i.test(filePath)) {
    const exported = ncrequire(filePath);
    if (exported instanceof Command) {
      commands[exported.name] = exported;
    } else {
      const value = exported[Object.keys(exported)[0]];
      if (value instanceof Command) {
        commands[value.name] = value;
      }
    }
  }
}
