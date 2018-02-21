const genPrompt = require("./genPrompt");

module.exports = msg => optionsD => options => genPrompt(Object.assign({}, optionsD, options));