import { default as actionLog } from "./actionLog";
import { default as doEval } from "./doEval";
import { default as sendIt } from "./sendIt";
import { default as userError } from "./userError";

import { Message } from "discord.js";

export default (msg: Message, hideDoEval: boolean = false) => ({
  actionLog: actionLog(msg), userError: userError(msg), doEval: hideDoEval ? null : doEval(msg),
  sendIt: sendIt(msg)
});
