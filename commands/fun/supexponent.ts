import { numupper } from "./numupper";

import Command from "../../classes/command";

export const supexponent = Command.aliasFrom(numupper, "supexponent", {
  perms: "numupper",
  default: true,
  description: "Replaces all exponents (`m^n` or `m**n`) in a math expression with their superscript equivalent. Similar \
to \`numupper\`, but only superscripts exponents. Note that this does not resolve expressions.",
  example: "{p}supexponent 56 * 10^4",
  msgNoNumbers: "Please ensure there's at least one number in your expression/text.",
  msgEmpty: "Please specify a math expression or text to superscript exponents!",
  embTitle: "Sent text with all exponents superscripted",
  replace: (text, arrup) => text.replace(/(\*\*|[ˆ^+-])\s*\d+/g, str => {
    const nums = str.match(/(?:\*\*|[ˆ^+-])\s*(\d+)/)[1];
    const numstr = nums.split("").map(n => arrup[n]).join("");
    return numstr;
  }),
  sentMsg: "Here is your message with all exponents set to superscript:",
  guildOnly: false
});
