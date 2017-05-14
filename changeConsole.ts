import * as colors from "chalk";

export default function editConsole(isMng: boolean, shardIDObj?: { id?: string }) {
  if (!(console.log as any).__wasChanged) {
    (console as any).oldLog = console.log;
    console.log = function() { // tslint:disable-line:only-arrow-functions
      const args = Array.from(arguments);
      args.unshift(colors.bgYellow.bold(isMng ? `[MNG]` : `[S${shardIDObj.id == null ? "?" : shardIDObj.id}]`) + " ");
      return (console as any).oldLog.apply({}, args);
    };
    Object.defineProperty(console.log, "__wasChanged", { value: true });
  }
  if (!(console.error as any).__wasChanged) {
    (console as any).oldError = console.error;
    console.error = function() { // tslint:disable-line:only-arrow-functions
      const args = Array.from(arguments);
      args.unshift(colors.bgYellow.bold(isMng ? `[MNG]` : `[S${shardIDObj.id == null ? "?" : shardIDObj.id}]`) + " ");
      return (console as any).oldError.apply({}, args);
    };
    Object.defineProperty(console.error, "__wasChanged", { value: true });
  }
}
