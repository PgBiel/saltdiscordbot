import logger from "../../classes/logger";

export default function djsDebug(info) {
  logger.custom(info, {
      prefix: `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`,
      color: "magenta"
  });
};

