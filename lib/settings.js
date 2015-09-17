var fs = require('fs');
var AppDirectory = require('appdirectory');
var dirs = new AppDirectory('sql-seer');
var configFile = dirs.userConfig() + "/electron-updater-settings.json";
function getSettings() {
    if (fs.existsSync(configFile)) {
        var data = fs.readFileSync(configFile, 'utf8');

        if (data) {
            return JSON.parse(data)
        } else {
            return {};
        }
    }
    return {};
}

function setSettings(settings, cb) {
    var value = settings ? JSON.stringify(settings) : "";
    fs.writeFile(configFile, value, cb);
}

function set(settings, cb) {
    setSettings(settings, cb);
}

function getRequestSettings() {
    var settings = getSettings();
    return settings && settings.proxy ? {
        'proxy': settings.proxy
    } : {};
}
module.exports = {
    set: set,
    getRequestSettings: getRequestSettings
}
