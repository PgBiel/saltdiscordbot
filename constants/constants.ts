import ncrequire from "../funcs/util/ncrequire";

const basePath = "../../constants/files/";
const names = ["emoji", "images", "identifiers", "maps", "numbers", "strings", "times", "regex", "unused/sql"];
names.forEach(n => ncrequire(basePath + n, false));

export { default as colors } from "./files/colors";
export { default as emoji } from "./files/emoji";
export { default as images } from "./files/images";
export { default as identifiers } from "./files/identifiers";
export { default as maps } from "./files/maps";
export { default as numbers } from "./files/numbers";
export { default as strings } from "./files/strings";
export { default as times } from "./files/times";
export { default as regex } from "./files/regex";
export { default as sql } from "./files/unused/sql";
