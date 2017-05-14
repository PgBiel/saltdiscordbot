"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
exports.commands = {};
const options = { nodir: true };
const files = deps_1.klaw("./commands", options);
for (const file of files) {
    const filePath = file.path;
    if (!/cmdIndex\.\w+$/i.test(filePath) && /\.js$/i.test(filePath)) {
        const exported = funcs_1.ncrequire(filePath);
        const value = exported[Object.keys(exported)[0]];
        if (value instanceof deps_1.Command) {
            exports.commands[value.name] = value;
        }
    }
}
