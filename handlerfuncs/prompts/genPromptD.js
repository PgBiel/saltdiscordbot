const genPrompt = require("./genPrompt");

module.exports = msg => optionsD => options => genPrompt(msg)(Object.assign({}, optionsD, options));