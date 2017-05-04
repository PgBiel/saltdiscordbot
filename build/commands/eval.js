"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const deps_1 = require("../util/deps");
const func = async (msg, { args, doEval, send }) => {
    if (msg.author.id !== deps_1.ownerID || args.length < 1) {
        return;
    }
    const results = await doEval(args);
    const resultStr = results.result.toString().replace(new RegExp(deps_1._.escapeRegExp(deps_1.bot.token), "ig"), "shaker");
    if (results.success) {
        send(`\`\`\`js
Input
${args}
Output
${resultStr}
\`\`\``);
    }
    else {
        send(`\`\`\`js
Input
${args}
Error
${resultStr}`);
    }
};
exports.evaler = new command_1.default({
    func,
    name: "eval",
    description: "Evaluate some text.",
    example: "+eval 1 + 1",
    category: "Private",
    guildOnly: false,
    customPrefix: "+",
    devonly: true,
});
