// typescript based file
/*
// tslint:disable:interface-name
import TableName from "./tableNames";

export type oneOrMany<T> = T | T[];

// indexing symbols:
// $ means by server ID, * means by user ID
interface TableValsDraft {
  coins: Array<HelperVals["coins"]>;
  coinRewards: Array<HelperVals["coinRewards"]>; // index: $
  economys: { // index: $
    eco_name?: string;
    eco_on?: boolean;
    daily?: number;
    daily_on?: boolean;
    rewards?: boolean;
    chat?: number;
    chat_on?: boolean;
  };
  /* chats: {
    serverid: string;
    userid: string;
    amount?: number;
  }; * /
  customcommands: Array<HelperVals["customcommands"]>; // index: $
  invites: boolean; // index: $
  triggers: Array<HelperVals["triggers"]>;
  levels: Array<HelperVals["levels"]>; // index: $
  levelInfos: { // index: $
    rewards: Array<{
      id: string;
      type?: "channel" | "role";
      level_earn?: number;
    }>;
    rewards_on?: boolean;
  };
  mods: { // index: $
    moderator?: oneOrMany<string>;
    administrator?: oneOrMany<string>;
    logs?: string;
    latestCase?: number;
  };
  mutes: { // index by Server ID ($)
    muteRoleID?: string;
  };
  immunemutes: Array<HelperVals["immunemutes"]>; // array of channel ids, index: $
  immuneLogs: Array<HelperVals["immuneLogs"]>; // array of channel ids, index: $
  activemutes: Array<HelperVals["activemutes"]>; // index: $
  perms: Array<HelperVals["perms"]>; // index: $
  prefixes: string; // the prefix. index: $
  punishments: Array<HelperVals["punishments"]>; // index: $
  autoroles: Array<HelperVals["autoroles"]>; // Role id. Index: $
  selfroles: Array<HelperVals["selfroles"]>; // index: $
  starboards: string; // channel id. Might include more options. index: $
  verifications: { // index: $
    channelid: string;
    roleid: string;
    message?: string;
    on?: boolean;
  };
  warns: Array<HelperVals["warns"]>; // index by: $
  warnsteps: Array<HelperVals["warnsteps"]>; // index by: $
  welcomes: { // index by: $
    welcome?: string;
    welcomechannel?: string;
    farewell?: string;
    farewellchannel?: string;
  };
}

export interface HelperVals {
  coins: {
    userid: string;
    amount?: number;
  };
  coinRewards: {
    id: string;
    type?: "channel" | "role";
  };
  // non array ones - start
  economys: null;
  invites: null;
  levelInfos: null;
  mods: null;
  mutes: null;
  prefixes: null;
  starboards: null;
  verifications: null;
  welcomes: null;
  // non array ones - end
  punishments: {
    type: string;
    moderator: string;
    time?: string;
    reason?: string;
    duration?: string;
    messageid?: string;
    case?: number;
    thumbnail?: string;
  };
  autoroles: string; // role id
  perms: {
    id: string;
    type: "member" | "channel" | "role" | "guild";
    command: string;
    is_custom?: boolean;
    extra?: string;
    negated?: boolean;
  };
  customcommands: {
    name?: string;
    creator?: string;
    channels?: string[];
    roles?: string[];
    members?: string[];
    response?: string;
  };
  triggers: {
    name?: string;
    response?: string;
    creator?: string;
  };
  levels: {
    userid: string;
    xp?: number;
    level?: number;
  };
  immunemutes: string; // channel id
  immuneLogs: string; // channel id
  activemutes: {
    userid: string;
    timestamp?: string;
    permanent?: boolean;
  };
  selfroles: {
    roleid: string;
    filter: Array<{
      id: string;
      type: "channel" | "member" | "role";
    }>;
  };
  warns: {
    userid: string;
    reason?: string;
    moderatorid?: string;
    warnedat?: string;
  };
  warnsteps: {
    amount: number;
    punishment: "kick" | "ban" | "softban" | "mute";
    time?: string;
  };
}

export type TableName = keyof TableValsDraft;

export type TableVals = TableValsDraft;

export default TableVals; */
