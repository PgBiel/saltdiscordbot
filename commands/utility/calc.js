const Command = require("../../classes/command");
const d = require("../../misc/d");

function changeOutput(obj) {
  const output = obj.result;
  if (output instanceof Error) return output;
  const isArr = Array.isArray(output);
  let workWith = [];
  const returnCodes = {
    OK: 0,
    CONCAT: 1,
    INVALID: 2
  };
  function loop(val) {
    if (val == null) return [undefined, returnCodes.INVALID];
    if (val instanceof d.mathjs.type.ResultSet) {
      let arrToAdd = [];
      for (const val2 of val.entries) {
        const res = loop(val2);
        if (res[1] === 1) {
          arrToAdd = arrToAdd.concat(res[0]);
        } else {
          arrToAdd = arrToAdd.concat([res[0]]);
        }
      }
      return [arrToAdd, returnCodes.CONCAT];
    }
    if (val._values) {
      return [val._values, returnCodes.CONCAT];
    }
    return [val, returnCodes.OK];
  }
  for (const val of d._.castArray(output)) {
    const res = loop(val);
    if (res[1] === returnCodes.CONCAT) {
      workWith = workWith.concat(res[0]);
    } else if (res[1] === returnCodes.INVALID) {
      continue;
    } else {
      workWith = workWith.concat([res[0]]);
    } 
  }
  return workWith.length < 2 && !isArr ? workWith[0] : workWith;
}

function resultText(input, output, error = false, resolved = false) {
  const result = d.textAbstract(
    String(changeOutput(output) || "")
      .replace(new RegExp(d._.escapeRegExp(d.bot.token), "ig"), "{shaker}")
      .replace(/^\w*Error:\s/, ""),
    1900
  );
  return `\`\`\`js
Expression
${input}
  
${error ? "Error" : "Result"}
${result}
\`\`\``;
}

const func = async function (msg, { args, doEval, send, reply, perms, guild, self }) {
  if (guild && !perms.calc) {
    return reply("Missing permission `calc`! :frowning:");
  }
  if (!args) return reply("Please specify a math expression!");
  const input = args.replace(/\*\*/g, "^").replace(/(?=\b)Math\./, "");
  const results = { success: false };
  try {
    results.result = d.mathjs.eval(input);
    results.success = true;
  } catch(err) {
    results.result = err;
  }
  const result = results;
  if (results.success) {
    if (result instanceof Promise) {
      const sent = await send(resultText(args, "[Waiting...]", false), { deletable: true });
      try {
        sent.edit(resultText(args, await Promise.resolve(result), false, true));
      } catch (err) {
        sent.edit(resultText(args, err, true, true));
      }
    } else {
      send(resultText(args, result, false), { deletable: true });
    }
  } else {
    send(resultText(args, result, true), { deletable: true });
  }
};
module.exports = new Command({
  func,
  name: "calc",
  perms: "calc",
  default: true,
  description: "Do maths.",
  example: `{p}calc 1 + 1
{p}calc pi * 2
{p}calc 6.66 * 10^50
{p}calc i ^ 2
{p}calc cos(25)`,
  category: "Utility",
  args: {"math expression": false},
  guildOnly: false
});