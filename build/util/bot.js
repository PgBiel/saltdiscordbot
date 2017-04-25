"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandClient_1 = require("../classes/commandClient");
exports.bot = new commandClient_1.default({
    disableEveryone: true,
    disabledEvents: ["TYPING_START"],
    fetchAllMembers: true,
});
