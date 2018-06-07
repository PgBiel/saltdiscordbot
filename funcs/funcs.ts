export function applyFuncs() { // this is first to fix resolving issue
  Object.entries(module.exports).forEach(([k, v]) => this[k] = v);
}

export * from "./bot/bot";
export * from "./clean/clean";
export * from "./compression/compression";
export * from "./dates/dates";
export * from "./handler/handler";
export * from "./intervals/intervals";
export * from "./logging/logging";
export * from "./numbers/numbers";
export * from "./parsers/parsers";
export * from "./regex/regex";
export * from "./shardComm/shardComm";
export * from "./strings/strings";
export * from "./util/util";
