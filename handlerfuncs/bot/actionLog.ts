import actionLogger, { ILogOption } from "../../classes/actionlogger";
import { Message } from "../../util/deps";

export default (msg: Message) => {
  return (options: ILogOption) => {
    if (!msg.guild) {
      return;
    }
    const newOptions = Object.assign({ guild: msg.guild }, options);
    return actionLogger.log(newOptions);
  };
};
