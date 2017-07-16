import { ban } from "./ban";

import Command from "../../classes/command";

export const idban = Command.aliasFrom(ban, "idban", {
  perms: "ban",
  banType: "idban",
  default: false,
  description: "Ban someone, but using an ID. This allows you to ban people outside the server.",
  example: "{p}idban 80351110224678912 Being b1nzy",
});
