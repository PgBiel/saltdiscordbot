const compress = require("./compress");

module.exports = function avatarCompress(url) {
  var end;
  if (url.match("embed")) {
    end = "-" + url.match(/(\w+).[a-z]+?$/)[1];
  } else {
    end = url.match(/(\w+)\.[a-z]+?$/)[1];
  }
  if (end.match(/^a_/)) {
    return "g" + compress(end.substr(2));
  }
  return compress(end);
};
