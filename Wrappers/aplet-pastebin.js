var pastebin = require("better-pastebin");
pastebin.setDevKey("24479c9222aa49e878bba886704164fc");

function getPaste(id) {
    var promise = new Promise(function(resolve, reject) {
        pastebin.get(id, function(success, data) {
            if(success) {
                resolve(data);
            } else {
                reject(data.message);
            }
        });
    });
    return promise;
}

function getJSONPaste(id) {
    var promise = new Promise(function(resolve, reject) {
        pastebin.get(id, function(success, data) {
            if(success) {
                try {
                    var json = JSON.parse(data);
                } catch (err) {
                    reject(err.message);
                }
                resolve(json);
            } else {
                reject(data.message);
            }
        });
    });
    return promise;
}

function getPasteID(string) {
    return string.match(/^(?:https?:\/\/)?(?:www\.)?(?:pastebin\.com\/)?(\w+)$/i)[1];
}

function hasPasteID(string) {
    return /^(?:https?:\/\/)?(?:www\.)?(?:pastebin\.com\/)?(\w+)$/i.test(string);
}

function createPaste(name, format, contents, json = false) {
    var promise = new Promise(function(resolve, reject) {
        try {
            pastebin.create({
                contents: json ? JSON.stringify(contents) : contents,
                anonymous: true,
                expires: "N",
                format,
                privacy: "0",
                name
            }, function(success, data) {
                if(success) {
                    resolve(data);
                } else {
                    reject(data.message);
                }
            });
        } catch (err) {
            reject(err.message);
        }
    });
    return promise;
}

function createJSONPaste(name, contents) {
    return createPaste(name, "json", contents, true);
}

module.exports = {
    getPaste,
    getJSONPaste,
    getPasteID,
    hasPasteID,
    createPaste,
    createJSONPaste
};