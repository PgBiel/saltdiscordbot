/* ******** Old CmdIndex ******** */
/* export * from "./8ball";
export * from "./avatar";

export * from "./ban";
export * from "./softban";
export * from "./noDelBan";

export * from "./eval";
export * from "./help";
export * from "./kick";
export * from "./ping";
export * from "./prefix";
export * from "./random";
export * from "./rip";
export * from "./unban"; */
const { Command, klaw } = require("../util/deps");
const { ncrequire } = require("../util/funcs");

const commands = {};
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

exports.commands = commands;
