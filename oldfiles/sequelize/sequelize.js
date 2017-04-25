const data = {};
fs.readdirSync("./models").forEach(model => {
  if (model.endsWith(".js")) {
    Object.entries(require(model)).forEach(([k, v]) => {
      data[k] = v;
    });
  }
});
module.exports = data;