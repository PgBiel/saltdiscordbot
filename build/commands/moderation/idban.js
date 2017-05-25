"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ban_1 = require("./ban");
const command_1 = require("../../classes/command");
exports.nodelban = command_1.default.aliasFrom(ban_1.ban, "idban", {
    perms: "ban",
    banType: "idban",
    default: false,
    description: "Ban someone, but using an ID. This allows you to ban people outside the server.",
    example: "{p}idban 80351110224678912 Being b1nzy",
});
