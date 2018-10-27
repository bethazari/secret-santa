var am = require("async-module")
module.exports = am(function(done){
    var router = require("express").Router()
    
    router.use(require("body-parser").json());

    var subrouters = require("fs").readdirSync(__dirname + "/rest")
    am.require(__dirname + "/rest", subrouters.map(function(s){ return "./" + s }))(function(){
    	Array.prototype.slice.call(arguments, 1).forEach(function(subrouter, i){
    		router.use("/" + subrouters[i].replace(/\.js$/, ""), subrouter)
    	})
    	done(arguments[0], router)
    })
})