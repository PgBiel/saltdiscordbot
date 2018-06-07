import logger from "../../classes/logger";
export default function doError(...stuff) {
  return logger.error.apply(logger, [...stuff]);
}