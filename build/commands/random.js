"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const funcs_1 = require("../util/funcs");
const func = async (msg, { arrArgs, reply }) => {
    if (arrArgs.length < 2) {
        reply("Please specify two numbers.");
        return;
    }
    const result = funcs_1.random(Number(arrArgs[0]), Number(arrArgs[1]));
    if (result == null) {
        reply("Please specify two **numbers**.");
        return;
    }
    reply(result);
};
exports.randomN = new command_1.default({
    func,
    name: "random",
    description: "Get a random number between two numbers.",
    example: "{p}random 1 10",
    category: "Fun",
    guildOnly: false,
});
