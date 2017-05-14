"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ban_1 = require("./ban");
const command_1 = require("../../classes/command");
exports.softban = command_1.default.aliasFrom(ban_1.ban, "softban", {
    perms: "softban",
    default: false,
    description: "Softban someone. (Ban and unban)",
    example: "{p}softban @Person#0000 Spam",
    banType: "softban",
    actions: ["Softbanning", "Softbanned", "softbanned", "Softban", "softban"],
    color: "ORANGE",
    usePrompt: false,
});
