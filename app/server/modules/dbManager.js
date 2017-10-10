var crypto = require('crypto');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var moment = require('moment');
var _ = require('lodash');

/*
    ESTABLISH DATABASE CONNECTION
*/

var dbName = process.env.DB_NAME || 'nodeTest';
var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;

var db = new MongoDB(dbName, new Server(dbHost, dbPort, { auto_reconnect: true }), { w: 1 });
db.open(function(e, d) {
    if (e) {
        console.log(e);
    } else {
        console.log('mongo :: connected to database :: "' + dbName + '"');
    }
});

var accounts = db.collection('accounts');
var allSongs = db.collection('allSongs');
var userSongs = db.collection('userSongs');

/* login validation methods */

exports.autoLogin = function(user, pass, callback) {
    accounts.findOne({ user: user }, function(e, o) {
        if (o) {
            o.pass == pass ? callback(o) : callback(null);
        } else {
            callback(null);
        }
    });
}

exports.manualLogin = function(user, pass, callback) {
    accounts.findOne({ user: user }, function(e, o) {
        if (o == null) {
            callback('user-not-found');
        } else {
            validatePassword(pass, o.pass, function(err, res) {
                if (res) {
                    callback(null, o);
                } else {
                    callback('invalid-password');
                }
            });
        }
    });
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback) {
    accounts.findOne({ user: newData.user }, function(e, o) {
        if (o) {
            callback('username-taken');
        } else {
            saltAndHash(newData.pass, function(hash) {
                newData.pass = hash;
                // append date stamp when record was created //
                newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                accounts.insert(newData, { safe: true }, callback);
            });
        }
    });
}

exports.addNewSong = function(newData, callback) {
    allSongs.findOne({ songName: newData.songName, artistName: newData.artistName }, function(err, songData) {
        if (err) {
            callback(err);
            console.log(err);
        } else {
            if (songData == null) {
                allSongs.insert(newData, (e, o) => {
                    if (e) {
                        callback(e);
                        console.log(err);
                    } else {
                        callback(null, "1");
                        console.log("song added in db");
                    }
                });
            } else {
                callback(null, "2");
                console.log("song already exist in db");
            }
        }
    });
}

exports.addSongToUser = function (userName, songName, callback) {
    userSongs.findOne({userName: userName}, (e, o)=>{
        if(e){
            callback(e);
        } else {
            if(o == null){
                userSongs.insert({
                    userName: userName,
                    songs: [songName]
                }, callback);
            } else {
                userSongs.update({
                    userName: userName
                },
                {
                    $addToSet: {
                        songs: songName
                    }
                }, callback);
            }
        }
    });
}

exports.getAllSongs = function(query, callback) {
    allSongs.find(query).toArray(callback);
}

exports.getUserSongs = function(userName, callback) {
    userSongs.aggregate([{
            $match: {
                userName: userName
            }
        },
        {
            $unwind: "$songs"
        }, {
            $lookup: {
                from: "allSongs",
                localField: "songs",
                foreignField: "songName",
                as: "songsData"
            }
        },
        {
            $group: {
                _id: "$userName",
                songs: {
                    $push: "$songsData"
                }
            }
        }
    ], (e, o) => {
        if (e) {
            callback(e);
        } else {
            var result = o && (o.length > 0) && o[0] || {};
            result.userName = result._id;
            result.songs = _.flatten(result.songs);
            callback(null, result);
        }
    });
}

exports.updateAccount = function(newData, callback) {
    accounts.findOne({ _id: getObjectId(newData.id) }, function(e, o) {
        o.name = newData.name;
        o.email = newData.email;
        o.country = newData.country;
        if (newData.pass == '') {
            accounts.save(o, { safe: true }, function(e) {
                if (e) callback(e);
                else callback(null, o);
            });
        } else {
            saltAndHash(newData.pass, function(hash) {
                o.pass = hash;
                accounts.save(o, { safe: true }, function(e) {
                    if (e) callback(e);
                    else callback(null, o);
                });
            });
        }
    });
}

/* account lookup methods */

exports.deleteAccount = function(id, callback) {
    accounts.remove({ _id: getObjectId(id) }, callback);
}

/* private encryption & validation methods */

var generateSalt = function() {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback) {
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
}

var getObjectId = function(id) {
    return new require('mongodb').ObjectID(id);
}