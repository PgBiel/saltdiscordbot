function authenticate(key, token) {
    var addSuggestion = function (name, desc, idList) {
        var promise = new Promise(function(resolve, reject) {
            var request = require("request");
            request.post({
                url: "https://api.trello.com/1/cards",
                headers: {'content-type': 'application/json'},
                json: {
                    idList,
                    key,
                    name,
                    desc,
                    token
                }
            }, function(error, response) {
                resolve(response.body);
            });
            }
        );
        return promise;
    }
    return {
        addSuggestion
    };
}

module.exports = {
    authenticate
}