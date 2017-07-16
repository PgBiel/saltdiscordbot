/* import * as util from "util";

export type DBType = {
  (...args: string[]): DBType;
  [prop: string]: DBType;
} & {
  list: string[];
  query: (...args: any[]) => Promise<any>;
}; */

/* const initialCmds = [
  "select", "insert", "update", "delete", "create", "drop", "alter",
]; */
/*
const stringStuff = ["toString", "valueOf", "inspect", Symbol.toPrimitive, (util.inspect as any).custom];

const handler = {
  get(t, k: string | symbol, r) {
    const listToUse: string[] = [];
    for (const item of (t.list || [])) {
      if (typeof item === "string") {
        listToUse.push(item);
      }
    }
    if (k === "list") {
      return listToUse.slice(0);
    } else if (k === "query") {
      return async (...args) => "B"; // TODO Magic querying stuff
    } else if (k === "proxy") {
      return r;
    } else if (stringStuff.includes(k)) {
      return () => listToUse.join(" ");
    } else if (k === Symbol.toStringTag) {
      return "SQLQuery";
    } else if (t[k]) {
      return t[k];
    }
    if (typeof k === "string") { listToUse.push(k); }
    t.list = listToUse;
    return r;
  },
  set(t, k: symbol | string, v, r): boolean {
    if (k === "list") { return false; }
    if (k === "proxy") {
      if (t.proxy) { return false; }
      t.proxy = r;
      return true;
    }
    t[k] = v;
    return true;
  },
};

const funct = function gen() {
  return function database(...args: string[]): DBType {
    const zeDb = database as any;
    let stringToPush: string = args.join(",");
    if (/^p$/i.test(zeDb.list[zeDb.list.length - 1])) {
      stringToPush = `(${stringToPush})`;
      zeDb.list.pop();
    }
    zeDb.list.push(stringToPush);
    return (database as any).proxy;
  };
};

export const db = (): DBType => {
  const proxy: DBType = new Proxy(funct(), handler);
  proxy.proxy = proxy;
  return proxy;
};
*/
