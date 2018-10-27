global._ = require("underscore")
global.async = require("async")

var Module = require("module");
Module.prototype.require = (function() {
    var superRequire = Module.prototype.require;
    return function() {
        if("async-module" == arguments[0]) {
            arguments[0] = __dirname + "/async-module";
        }
        return superRequire.apply(this, arguments);
    }
})();

require("async-module").require(__dirname, ["express", "./webapp/html", "./webapp/rest"])(function(err, express, html, rest){
    if(!err){
        var config = require("./config")
        express()
            .use("/rest", rest)
            .use("/", html)
            .listen(config.server.port, config.server.ip)
        console.log("listening", [config.server.ip, config.server.port].join(":"));
    } else {
        console.log("can't start. err is", err);
    }
})