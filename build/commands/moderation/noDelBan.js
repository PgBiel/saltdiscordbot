"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ban_1 = require("./ban");
const command_1 = require("../../classes/command");
exports.nodelban = command_1.default.aliasFrom(ban_1.ban, "nodelban", {
    perms: "ban",
    default: false,
    description: "Ban someone, but without deleting any of their messages with it.",
    example: "{p}nodelban @EvilGuy#0100 Being evil but not as much",
    days: 0,
});
