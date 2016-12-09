function getKey(privateKey) {
    var promise = new Promise(function(resolve, reject) {
        var request = require("request");
        request("https://runkit.io/aplet123/full-encryption/1.0.0?method=getKey&text=" + privateKey, function(error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if (data.error) {
                        reject(data.error.toUpperCase());
                    } else {
                        resolve(data.text);
                    }
                } else {
                    reject("API MAY BE DOWN OR IS NOT WORKING PROPERLY");
                }
            } else {
                reject("UNKNOWN ERROR");
            }
        });
    });
    return promise;
}

function encrypt(publicKey, text) {
    var promise = new Promise(function(resolve, reject) {
        var request = require("request");
        request("https://runkit.io/aplet123/full-encryption/1.0.0?method=encrypt&key=" + publicKey + "&text=" + text, function(error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if (data.error) {
                        reject(data.error.toUpperCase());
                    } else {
                        resolve(data.text);
                    }
                } else {
                    reject("API MAY BE DOWN OR IS NOT WORKING PROPERLY");
                }
            } else {
                reject("UNKNOWN ERROR");
            }
        });
    });
    return promise;
}

function decrypt(privateKey, text) {
    var promise = new Promise(function(resolve, reject) {
        var request = require("request");
        request("https://runkit.io/aplet123/full-encryption/1.0.0?method=decrypt&key=" + privateKey + "&text=" + text, function(error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if (data.error) {
                        reject(data.error.toUpperCase());
                    } else {
                        resolve(data.text);
                    }
                } else {
                    reject("API MAY BE DOWN OR IS NOT WORKING PROPERLY");
                }
            } else {
                reject("UNKNOWN ERROR");
            }
        });
    });
    return promise;
}

module.exports = {
    getKey,
    encrypt,
    decrypt
};
