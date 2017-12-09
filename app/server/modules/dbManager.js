var crypto = require('crypto');
var mysql = require('mysql');
var moment = require('moment');
var _ = require('lodash');
var bcrypt = require('bcrypt');

let host = process.env.DB_HOST;
let port = process.env.DB_PORT;
let user = process.env.DB_USER;
let database = process.env.DB_NAME;
let password = process.env.DB_PASSWORD;
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

exports.manualLogin = function(user, pass) {
    return new Promise((resolve, reject) => {
        var query = "Select * from User where `uid`='" + user + "';";
        db.query(query, (err, result) => {
            if (err) {
                reject('user-not-found');
            } else {
                if (result.length > 0) {
                    validatePassword(pass, result[0].pass, function(err, res) {
                        if (res) {
                            resolve(result);
                        } else {
                            reject('invalid-password');
                        }
                    });
                } else {
                    reject('user-not-found');
                }
            }
        });
    });
}

exports.addNewAccount = function(req) {
    return new Promise((resolve, reject) => {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.pass, salt);
        db.query('call new_user(?, ?, ?,?,?)', [req.user, req.name, hash, req.city, req.email], function(err, results) {
            if (err) {
                reject('username-taken');
            } else {
                resolve(results);
            }
        });
    });
}

exports.searchKeyword = function(keyword, userName) {
    return new Promise((resolve, reject) => {
        db.query('call SearchTracks(?, ?)', [keyword, userName], function(err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

exports.searchAlbumKeyword = function(keyword) {
    return new Promise((resolve, reject) => {
        var query = "select abid, abtitle from album where abtitle like '%" + keyword + "%';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

}

exports.searchTrackKeyword = function(keyword) {
    return new Promise((resolve, reject) => {
        var query = "select sid, stitle from songs where stitle like '%" + keyword + "%';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.searchArtistKeyword = function(keyword) {
    return new Promise((resolve, reject) => {
        var query = "select aid, aname from artist where aname like '%" + keyword + "%';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

}

exports.searchPlayListKeyword = function(keyword) {
    return new Promise((resolve, reject) => {
        var query = "select pid, ptitle from playlist where ptype = 'public' and ptitle like '%" + keyword + "%';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.searchPlays = function(key, keyVal) {
    return new Promise((resolve, reject) => {
        var query = '';
        if (key == 'sid' || key == 'tid') {
            query = "select s.sid,stitle, sduration, aname from songs s join artist a on s.aid = a.aid where s.sid='" + keyVal + "';";
        } else if (key == 'aid') {
            query = "select s.sid,stitle, sduration,a.aid, aname,s.reldate from songs s join artist a on s.aid = a.aid where a.aid='" + keyVal + "' LIMIT 40;";
        } else if (key == 'abid') {
            query = "select s.sid,stitle, sduration,abtitle, aname from songs s join Artist a on a.aid = s.aid join albumsong absg on absg.sid = s.sid join album ab on ab.abid = absg.abid  where ab.abid='" + keyVal + "';";
        } else if (key == 'pid') {
            query = "select p.pid,s.sid,stitle,sduration,ptitle, aname from playlist p join pltrack ps on p.pid = ps.pid join songs s on s.sid = ps.sid join artist a on a.aid = s.aid where p.ptype = 'public' and p.pid='" + keyVal + "';";
        } else if (key == 'pidc') {
            query = "select p.pid,s.sid,stitle,sduration,ptitle, aname from playlist p join pltrack ps on p.pid = ps.pid join songs s on s.sid = ps.sid join artist a on a.aid = s.aid where p.pid='" + keyVal + "';";
        }
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.getPlayListKeyword = function(username) {
    return new Promise((resolve, reject) => {
        var query = "select pid,ptitle, ptype from playlist where uid = '" + username + "';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.addNewPlaylist = function(uid, name, type) {
    return new Promise((resolve, reject) => {
        db.query('call new_playlist(?,?, ?)', [uid, name, type], function(err, results) {
            if (err) {
                reject('insert-failed');
            } else {
                resolve(results);
            }
        });
    });
}

exports.getMostRecentPlayList = function() {
    return new Promise((resolve, reject) => {
        var query = "select pid,ptitle, ptype from playlist where ptype = 'public' order by preldt desc LIMIT 5;";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.searchRecentAlbum = function() {
    return new Promise((resolve, reject) => {
        var query = "select abid, abtitle from album LIMIT 5;";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

var validatePassword = function(plainPass, hashedPass, callback) {
    bcrypt.compare(plainPass, hashedPass, function(err, ress) {
        if (ress) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
}