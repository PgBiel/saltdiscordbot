"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
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
__export(require("./models/coins"));
__export(require("./models/customcommands"));
__export(require("./models/detects"));
__export(require("./models/moderation"));
__export(require("./models/mutes"));
__export(require("./models/levels"));
__export(require("./models/perms"));
__export(require("./models/prefix"));
__export(require("./models/punishments"));
__export(require("./models/roles"));
__export(require("./models/warns"));
__export(require("./models/welcfarew"));
