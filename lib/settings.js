var tunnel = require('tunnel');
var proxy = "abc";

function set(settings) {
    if (settings) {
        proxy = settings.proxy;
    }
}

function getGotConfig() {
    return {
        json: true,
        // agent: tunnel.httpOverHttp({
        //     proxy: {
        //         host: 'localhost', //http://seaproxy.tech.local
        //         port: 8080
        //     }
        // })
    };
}
module.exports = {
    set: set,
    getGotConfig: getGotConfig
}
