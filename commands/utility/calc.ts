import Command from "../../classes/command";
import { mathjs, textAbstract, _, bot } from "../../misc/d";
import { cmdFunc } from "../../misc/contextType";

mathjs.config({
  number: "BigNumber", // Default type of number:
                       // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 16        // Number of significant digits for BigNumbers
});

/**
 * Remove invalid numbers & modify strings
 * @param {*} output The output generated
 * @returns {*|Array<*>} The filtered output
 */
function changeOutput(output): any {
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
    if (val instanceof (mathjs as any).type.ResultSet) {
      let arrToAdd = [];
      for (const val2 of val.entries) {
        const res = loop(val2);
        if (res[1] === 1) {
          arrToAdd = arrToAdd.concat(res[0]);
        } else if (res[1] === returnCodes.INVALID) {
          continue;
        } else {
          arrToAdd = arrToAdd.concat([res[0]]);
        }
      }
      return [arrToAdd, returnCodes.CONCAT];
    }
    if (val._values) {
      let arrToAdd = [];
      for (const val2 of val._values) {
        const res = loop(val2);
        if (res[1] === returnCodes.CONCAT) {
          arrToAdd = arrToAdd.concat(res[0]);
        } else if (res[1] === returnCodes.INVALID) {
          continue;
        } else {
          arrToAdd = arrToAdd.concat([res[0]]);
        }
      }
      return [arrToAdd, returnCodes.CONCAT];
    }
    if (typeof val === "function") {
      return [`«Function ${val.name || "Anonymous"}»`, returnCodes.OK];
    }
    return [val, returnCodes.OK];
  }
  for (const val of _.castArray(output)) {
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

/**
 * Stylize the output text
 * @param {string} input The input
 * @param {*} output The output generated
 * @param {boolean} [error=false] If an error occurred
 * @param {boolean} [resolved=false] If a promise was returned
 */
function resultText(input: string, output: any, error = false, resolved = false) {
  const result: string = textAbstract(
    String(changeOutput(output) || "")
      .replace(new RegExp(_.escapeRegExp(bot.token), "ig"), "{shaker}")
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

const func: cmdFunc<{}> = async function(msg, { args, doEval, send, reply, perms, guild, self }) {
  if (guild && !perms.calc) {
    return reply("Missing permission `calc`! :frowning:");
  }
  if (!args) return reply("Please specify a math expression!");
  const input: string = args.replace(/\*\*/g, "^").replace(/(?=\b)Math\./, "");
  const results = { success: false, result: undefined };
  try {
    results.result = mathjs.eval(input);
    results.success = true;
  } catch (err) {
    results.result = err;
  }
  const { result } = results;
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

export const calc = new Command({
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
  aliases: {
    math: {
      description: "Alias to calc",
      example: `{p}math 1 + 1
{p}math pi * 2
{p}math 6.66 * 10^50
{p}math i ^ 2
{p}math cos(25)`
    }
  },
  guildOnly: false
});
