import { ban } from "./ban";

import Command from "../../classes/command";

export const nodelban = Command.aliasFrom(ban, "nodelban", {
  perms: "ban",
  default: false,
  description: "Ban someone, but without deleting any of their messages with it.",
  example: "{p}nodelban @EvilGuy#0100 Being evil but not as much",
  days: 0,
});
