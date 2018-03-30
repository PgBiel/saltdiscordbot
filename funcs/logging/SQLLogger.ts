import logger from "../../classes/logger";
export default function SQLLogger(...stuff) {
  return logger.custom(stuff.join(" "), { prefix: "[SQL]", color: "yellow" });
};
