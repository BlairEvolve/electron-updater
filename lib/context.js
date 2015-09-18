var directory = require('./directory.js'),
    path = require('path'),
    fs = process.versions.electron ? require('original-fs') : require('fs'),
    async = require('async'),
    file = require('./file.js'),
    os = require('os');
var defaultRegistry = "https://registry.npmjs.org"

function isDevDirectory(appDir) {
    var gitDir = path.join(appDir, '.git')
    var svnDir = path.join(appDir, '.svn')
    try {
        fs.readdirSync(gitDir);
        return true;
    } catch (e) {
        try {
            fs.readdirSync(svnDir);
            return true;
        } catch (e) {
            return false;
        }
    }
}

function readNpmrc(appDir) {
    var npmrc = path.join(appDir, '.npmrc');
    try {
        var contents = fs.readFileSync(npmrc, {
            encoding: 'utf8'
        });

        var registry = defaultRegistry
        var match = 'registry='
        contents.split('\n').forEach(function (line) {
            line = line.trim()
            if (line.indexOf(match) === 0) {
                registry = line.substring(match.length).replace(/\n/g, '')
                return false
            }
        })
        return registry;
    } catch (e) {
        return defaultRegistry;
    }
}

function load(appDir, callback) {
    if (!appDir) throw new Error('Failed to load app context: invalid argument')
    var dev = isDevDirectory(appDir);
    var registry = readNpmrc(appDir);
    var packagePath = path.join(appDir, 'package.json');
    var package = file.readJsonSync(packagePath);
    var name = package.name
    var version = package.version
    var publisher = package.publisher || name
    var defaultChannel = package.defaultChannel || 'latest'
    var appData = directory.appDir(publisher, name)
    var pendingUpdatePath = path.join(appData, '.update')
    var channelPath = path.join(appData, '.channel')
    var channel;
    try {
        channel = fs.readFileSync(channelPath, {
            encoding: 'utf8'
        });
    } catch (e) {
        channel = defaultChannel;
    }
    var err = false,
        updateContents = "";
    try {
        updateContents = fs.readFileSync(pendingUpdatePath, {
            encoding: 'utf8'
        });
    } catch (e) {
        err = true;
    }
    var updatePending = !err && updateContents === 'PENDING'
    var updateInProgress = !err && updateContents === 'INPROGRESS'
    var ctx = {
        name: name,
        version: version,
        publisher: publisher,
        channel: channel,
        dev: dev,
        platform: os.platform(),
        arch: os.arch(),
        configuration: dev ? 'debug' : 'release',
        updatePending: updatePending,
        updateInProgress: updateInProgress,
        registry: registry,
        appDir: appDir,
        dependencies: package.dependencies || {},
        plugins: package.plugins || {}
    }
    if (callback)
        callback(null, ctx)
    return ctx;
}


module.exports = {
    load: load
}
