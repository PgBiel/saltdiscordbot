import logger from "../../classes/logger";

export default function djsWarn(info) {
  logger.custom(info, { prefix: `[DJS WARN]`, color: "yellow" });
};
