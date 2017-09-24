/* import { fs } from "../util/deps";

 const data = {};
fs.readdirSync("./models").forEach((model: any) => {
  if (model.endsWith(".js")) {
    Object.entries(require(model)).forEach(([k, v]) => {
      data[k] = v;
    });
  }
});
module.exports = data; */
export * from "./models/coins";
export * from "./models/customcommands";
export * from "./models/detects";
export * from "./models/moderation";
export * from "./models/mutes";
export * from "./models/levels";
export * from "./models/perms";
export * from "./models/prefix";
export * from "./models/punishments";
export * from "./models/roles";
export * from "./models/starboard";
export * from "./models/warns";
export * from "./models/welcfarew";
