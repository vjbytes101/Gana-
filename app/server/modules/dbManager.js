var crypto = require('crypto');
var mysql = require('mysql');
var moment = require('moment');
var _ = require('lodash');
var bcrypt = require('bcrypt');

let host = process.env.DB_HOST || 'localhost';
let port = process.env.DB_PORT || '3306';
let user = process.env.DB_USER || 'root';
let database = process.env.DB_NAME || 'project2';
let password = process.env.DB_PASSWORD || 'root';
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

exports.searchPlays = function(key, keyVal, uid) {
    return new Promise((resolve, reject) => {
        var query = '';
        if (key == 'sid' || key == 'tid') {
            query = "select s.sid, s.stitle, s.sduration, a.aname from songs s, artist a where s.aid = a.aid and s.sid='" + keyVal + "'";
        } else if (key == 'aid') {
            query = "select s.sid, s.stitle, s.sduration, a.aid, a.aname from songs s, artist a where s.aid = a.aid and a.aid='" + keyVal + "'";
        } else if (key == 'abid') {
            query = "select s.sid, s.stitle, s.sduration,ab.abid, ab.abtitle, a.aname from songs s, Artist a, albumsong absg, album ab where ab.abid = absg.abid and absg.sid = s.sid and a.aid = s.aid and ab.abid='" + keyVal + "'";
        } else if (key == 'pid') {
            query = "select p.pid, s.sid, s.stitle, s.sduration, p.ptitle, a.aname from playlist p, pltrack ps, songs s, artist a where a.aid = s.aid and s.sid = ps.sid and p.pid = ps.pid and p.ptype = 'public' and p.pid='" + keyVal + "'";
        } else if (key == 'pidc') {
            query = "select p.pid, s.sid, s.stitle, s.sduration, p.ptitle, a.aname from playlist p, pltrack ps, songs s, artist a where a.aid = s.aid and s.sid = ps.sid and p.pid = ps.pid and p.pid='" + keyVal + "'";
        }
        query = "select t.*, r.rating from (" + query + ") as t left outer join (select sid,rating from rating r where uid='" + uid + "')as r on t.sid = r.sid;";
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

exports.deletePlayList = function(pid) {
    return new Promise((resolve, reject) => {
        db.query('call delete_playlist(?)', [pid], function(err, results) {
            console.log(pid);
            if (err) {
                reject('delete-failed');
            } else {
                resolve(results);
            }
        });
    });
}

exports.addNewPlaylist = function(uid, name, type,Qtype,plid) {
    return new Promise((resolve, reject) => {
        if(Qtype == 'update'){
            console.log(plid);
            console.log(name);
            console.log(name);
            console.log(type);
            console.log(Qtype);
            db.query('call update_playlist(?,?, ?)', [plid, name, type], function(err, results) {
                if (err) {
                    reject('insert-failed');
                } else {
                    resolve(results);
                }
            });
        }else{
            db.query('call new_playlist(?,?, ?)', [uid, name, type], function(err, results) {
                if (err) {
                    reject('insert-failed');
                } else {
                    resolve(results);
                }
            });
        }
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

exports.addRating = function(uid, sid, rating) {
    return new Promise((resolve, reject) => {
        var query = "INSERT INTO rating (`uid`, `sid`, `rating`, `rdate`) VALUES('" + uid + "', '" + sid + "', " + rating +", NOW()) ON DUPLICATE KEY UPDATE rating="+ rating +", rdate=NOW();";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.addArtistLikes = function(uid, aid) {
    return new Promise((resolve, reject) => {
        var query = "INSERT INTO Likes (`uid`, `aid`, `likedt`) VALUES('" + uid + "', '" + aid + "', NOW()) ON DUPLICATE KEY UPDATE likedt=NOW();";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.deleteArtistLikes = function(uid, aid) {
    return new Promise((resolve, reject) => {
        var query = "DELETE FROM Likes WHERE uid='" + uid + "' and aid='"+ aid + "';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.checkArtistLikes = function(uid, aid) {
    return new Promise((resolve, reject) => {
        var query = "select * from Likes where uid='" + uid + "' and aid = '" + aid + "';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.getmyPl = function(uid) {
    return new Promise((resolve, reject) => {
        var query = "select pid,ptitle from playlist where uid = '" + uid + "';";
        db.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.addmyPl = function(sid,pid,keyV) {
    return new Promise((resolve, reject) => {
        if(keyV == 'pidc'){
            var query = "Delete from pltrack where pid='" + pid + "'and sid= '" + sid + "';";
        }else{
            var query = "INSERT INTO pltrack (`pid`, `sid`, `snumber`) VALUES('" + pid + "', '" + sid + "', '" + pid + "');";
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

exports.addtoplay = function(uid,sid,pid,abid) {
    return new Promise((resolve, reject) => {
        if(pid == '' && abid == ''){
            var query = "INSERT INTO plays (`uid`, `sid`, `playstime`) VALUES('" + uid + "','" + sid + "', NOW());";
        }
        else if(abid == ''){
            var query = "INSERT INTO plays (`uid`, `pid`, `sid`, `playstime`) VALUES('" + uid + "', " + pid + ",'" + sid + "', NOW());";
        }else if(pid == ''){
            var query = "INSERT INTO plays (`uid`, `sid`, `abid`, `playstime`) VALUES('" + uid + "','" + sid + "', '" + abid + "', NOW());";
        }
        else{
            var query = "INSERT INTO plays (`uid`,`pid`, `sid`, `abid`, `playstime`) VALUES('" + uid + "', " + pid + ",'" + sid + "', '" + abid + "', NOW());";
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