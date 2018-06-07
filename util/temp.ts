// this file is for keeping an "universal" data object
import { Storage } from "saltjs";

const store = new Storage<string, any>();
store.set("cacheGuilds", []);

export default store;
export { store };
