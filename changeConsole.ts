import * as colors from "chalk";

(console as any).oldLog = console.log;
console.log = function() { // tslint:disable-line:only-arrow-functions
  const args = Array.from(arguments);
  args.unshift(colors.bgYellow.bold(`[MNG]`) + " ");
  return (console as any).oldLog.apply({}, args);
};
(console as any).oldError = console.error;
console.error = function() { // tslint:disable-line:only-arrow-functions
  const args = Array.from(arguments);
  args.unshift(colors.bgYellow.bold(`[MNG]`) + " ");
  return (console as any).oldError.apply({}, args);
};
