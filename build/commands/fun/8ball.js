"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../classes/command");
const funcs_1 = require("../../util/funcs");
const func = async (msg, { args, reply }) => {
    if (!args) {
        return reply("Please say a question!");
    }
    const answers = [
        "Very probably.",
        "High chance of so.",
        "Sure.",
        "Maybe.",
        "I wouldn't say so.",
        "Low chance of so.",
        "Very unlikely.",
    ];
    reply(answers[funcs_1.random(0, answers.length - 1)]);
};
exports.eightball = new command_1.default({
    func,
    name: "8ball",
    perms: "8ball",
    default: true,
    description: "See the answer to your questions...",
    example: "{p}8ball Is chocolate nice?",
    category: "Fun",
    args: { question: false },
    guildOnly: false,
});
