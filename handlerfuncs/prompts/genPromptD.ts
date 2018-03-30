import genPrompt, { IGenPromptOptions } from "./genPrompt";
import { Message } from "../../util/deps";

export default (msg: Message) =>
  /**
   * Generate default options to use with gen prompt
   */
  (optionsD: IGenPromptOptions) =>
    (options: IGenPromptOptions) => genPrompt(msg)(Object.assign({}, optionsD, options));
