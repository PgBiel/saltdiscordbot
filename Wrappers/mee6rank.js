function getRank(serverID, userID) {
    var promise = new Promise(function(resolve, reject) {
        try {
        var request = require("request");
        request("https://mee6.xyz/levels/" + (serverID === undefined ? reject("NO SERVER GIVEN") : serverID) + "?json=1&limit=-1",
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var players;
                    try {
                        var data = JSON.parse(body);
                        players = data.players;
                    } catch (err) {
                        reject("SERVER IS NOT REGISTERED");
                    }
                    if (userID === undefined) {
                        reject("NO USER GIVEN");
                    } else {
                        var user;
                        try {user = players.find(v => v.id === userID);} catch (err) {reject("UNKNOWN ERROR");}
                        if (user === undefined) {
                            reject("USER NOT RANKED");
                        } else {
                            var finalData = user;
                            finalData.rank = players.indexOf(user) + 1;
                            finalData.totalRank = players.length;
                            finalData.level = user.lvl;
                            resolve(finalData);
                        }
                    }
                } else {
                    reject("UNKNOWN ERROR");
                }
            });
        }catch (err) {
            reject("UNKNOWN ERROR");
        }
    });
    return promise;
}

module.exports = {
    getRank
};
