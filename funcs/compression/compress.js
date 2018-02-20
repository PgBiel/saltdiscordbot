module.exports = function compress(str) {
  str = String(str);
  if (str.length == 1) {
    return str;
  }
  if (str.length % 2 != 0) {
    str = "0" + str;
  }
  return Buffer.from(str, "hex").toString("base64").replace(/=/g, "");
};
