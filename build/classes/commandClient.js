"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class CommandClient extends discord_js_1.Client {
    constructor(options = {}) {
        super(options);
        this.commands = {};
    }
}
exports.default = CommandClient;
