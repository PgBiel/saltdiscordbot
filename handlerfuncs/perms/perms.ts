import { default as checkRole } from "./checkRole";
import { default as hasPermission } from "./hasPermission";
import { default as seePerm } from "./seePerm";

import { Message } from "discord.js";

export default (msg: Message) => ({
  checkRole: checkRole(msg), hasPermission: hasPermission(msg), seePerm: seePerm(msg)
});
