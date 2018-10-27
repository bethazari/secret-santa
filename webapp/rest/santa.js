module.exports = require("async-module")(function(done){
    async.waterfall([
        function(done){
            var config = require("../../config");
            var mongodbUrl = config.db.url;
            if(mongodbUrl){
                var mongodb = require("mongodb");
                mongodb.MongoClient.connect(mongoDbUrl, function(err, db) {
                    db.ObjectId = mongodb.ObjectID;
                    done(err, db);
                });
            } else {
                var nedbPath = config.db.nedb;
                const Nedb = require("nedb");
                var db = new Nedb({ filename: config.db.nedb, autoload: true, onload: err => {
                  db.collection = function(){
                    return db;
                  }
                  db.ObjectId = function(s){ return s; }
                  db.save = function(obj, options, done){
                    db.update({_id: obj._id}, obj, {upsert: true}, function(err, numAffected, affectedDocuments, upsert){
                        obj._id = affectedDocuments._id;
                        done(err);
                    });
                  }
                  done(err, db);
                }});
            }
        },
        function(db, done){
            var router = require("express").Router();

            router.post("/save", function(req, res, next){
                var members = req.body.members.map(function(member){
                    return {
                        member: member,
                        password: Math.random().toString(36).slice(-8)
                    }
                });
                var maxAttempts = 10000;
                var remixedMembers;
                var success = false;
                var attempts = maxAttempts;
                while(attempts--){
                    remixedMembers = _.sortBy(members, Math.random);
                    if(req.body.tabu.filter(function(tabu){
                        var left = _.findWhere(remixedMembers, {member: tabu[0]});
                        return (remixedMembers[remixedMembers.indexOf(left) + 1] || remixedMembers[0]).member == tabu[1];
                    }).length == 0){
                        success = true;
                        break;
                    }
                }
                if(success){
                    var santa = {
                        members: remixedMembers
                    }
                    db.collection("santa").save(santa, {}, function(err, results){
                        res.json({
                            members: members.map(function(member){ return _.extend(member, {password: santa._id + ":" + member.password}) })
                        });
                    });
                } else {
                    res.status(500).send(["Попробовал", maxAttempts, "вариантов и не могу подобрать вам! Может, много табу?"].join(" "));
                }
            });

            router.post("/getReceiver", function(req, res, next){
                var splitted = req.body.password.split(":");
                var id = splitted[0];
                var password = splitted[1];
                db.collection("santa").findOne({_id: db.ObjectId(id)}, function(err, santa){
                    var member = _.findWhere(santa.members, {password: password});
                    res.json((santa.members[santa.members.indexOf(member) + 1] || santa.members[0]).member);
                });
            });

            done(null, router);            
        }
    ], done);
});