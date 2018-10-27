module.exports = require("async-module")(function(done){
    var express = require("express")
    var router = express.Router();

    router.use(express.static(__dirname + "/html"));

    done(null, router)
})