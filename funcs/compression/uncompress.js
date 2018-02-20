module.exports = function uncompress(str) {
  str = String(str);
  if (str.length == 1) {
    return str;
  }
  var ret = Buffer.from(str + "=".repeat(str.length % 4), "base64").toString("hex");
  if (ret[0] == "0") {
    ret = ret.substr(1);
  }
  return ret;
};
