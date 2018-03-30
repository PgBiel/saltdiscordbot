import prompt, { IBasePromptOptions } from "./prompt";
import { Message } from "../../util/deps";
import { MPromptFunc } from "../../classes/multiprompt";

export interface IGenPromptOptions extends IBasePromptOptions {

  question?: null;
  /**
   * Array to set result to
   */
  array?: string[];
  /**
   * Index to set on the array (otherwise just push)
   */
  index?: number;

  /**
   * Which branch to go?
   */
  branch?: (res: string, cancelled: boolean, skipped: boolean) => string;

  /**
   * If should execute the branch we went to (otherwise just keep it untouched, defaults to false)
   */
  exec?: boolean;
  /**
   * If should execute the branch even if prompt was cancelled (defaults to false)
   */
  goCancelled?: boolean;
}

/**
 * @returns A function to be used with multiprompt question
 */
export default (msg: Message) => {
  /**
   * Generate a function to be used with multiprompt question
   */
  return (options: IGenPromptOptions): MPromptFunc<Promise<void>> => {
    return async function(): Promise<void> {
      const { res, cancelled, skipped } = await (prompt(msg)(Object.assign({ question: this.text }, options)));
      if (options.array) {
        if (typeof options.index === "number" && !isNaN(options.index)) {
          options.array[options.index] = res;
        } else {
          options.array.push(res);
        }
      }
      if (typeof options.branch === "function") {
        const branch = (this.branch(options.branch(res, cancelled, skipped)) || { exec: async () => undefined } as never);
        if (options.exec && (options.goCancelled ? true : !cancelled)) await branch.exec();
      }
    };
  };
};
