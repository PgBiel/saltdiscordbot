import * as _ from "lodash";

export default function followPath<Result, T extends object>(obj: T, path: string | number | string[]): Result {
  if (!Array.isArray(path)) path = _.toPath(path);
  return path.reduce(
    (prev, curr) => typeof curr === "string" || typeof curr === "number" && curr !== "" ? (prev || {})[curr] : prev,
    obj
  );
}
