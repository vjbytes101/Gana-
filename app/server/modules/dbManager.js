var crypto = require('crypto');
var mysql = require('mysql');
var moment = require('moment');
var _ = require('lodash');
var bcrypt = require('bcrypt');

let host = process.env.DB_HOST;
let port = process.env.DB_PORT;
let user = process.env.DB_USER;
let database =  process.env.DB_NAME;
let password =  process.env.DB_PASSWORD;
var db = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

db.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + db.threadId);
});

exports.searchKeyword = function(keyword,userName, callback) {
    
    db.query('call SearchTracks(?, ?)', [keyword, userName], function(err, results) { 
        if (err) {
            console.log(err);
            //callback('username-taken');
        }else{
            callback(null, results[0]);
        }
    });
}
// var accounts = db.collection('accounts');
// var allSongs = db.collection('allSongs');
// var userSongs = db.collection('userSongs');

/* login validation methods */
/*
exports.autoLogin = function(user, pass, callback) {
    accounts.findOne({ user: user }, function(e, o) {
        if (o) {
            o.pass == pass ? callback(o) : callback(null);
        } else {
            callback(null);
        }
    });
}*/

exports.manualLogin = function(user, pass, callback) {
    var query = "Select * from User where `uid`='" + user + "';";
    db.query(query, (err, result)=>{
        if(err){
            callback('user-not-found');
        }else{
            if(result.length>0){
                validatePassword(pass, result[0].pass, function(err, res) {
                    if (res) {
                        callback(null, result);
                    } else {
                        callback('invalid-password');
                    }
                });
            }
            else{
                callback('invalid-password');
            }
        }
    });
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(req, callback) {
    
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.pass, salt);
    db.query('call new_user(?, ?, ?,?,?)', [req.user, req.name, hash,req.city,req.email], function(err, results) { 
        if (err) {
            console.log(err);
            callback('username-taken');
        }else{
            callback(null, results);
        }
    });
}
/*
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

exports.addSongToUser = function(userName, songName, callback) {
    userSongs.findOne({ userName: userName }, (e, o) => {
        if (e) {
            callback(e);
        } else {
            if (o == null) {
                userSongs.insert({
                    userName: userName,
                    songs: [songName]
                }, callback);
            } else {
                userSongs.update({
                    userName: userName
                }, {
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
*/
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
    bcrypt.compare(plainPass, hashedPass, function(err, ress) {
        if(ress){
            callback(null, true);
        }else{
            callback(null, false);
        }
    });
}

var getObjectId = function(id) {
    return new require('mongodb').ObjectID(id);
}


