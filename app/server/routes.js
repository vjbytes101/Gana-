var AM = require('./modules/dbManager');

module.exports = function(app) {

    // main login page //
    app.get('/', function(req, res) {
        // check if the user's credentials are saved in a cookie //
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.render('login', { title: 'Hello - Please Login To Your Account' });
        } else {
            res.redirect('/home');
        }
    });

    app.post('/', function(req, res) {
        AM.manualLogin(req.body['user'], req.body['pass'], function(e, o) {
            if (!o) {
                res.status(400).send(e);
            } else {
                req.session.user = o;
                if (req.body['remember-me'] == 'true') {
                    res.cookie('user', o.user, { maxAge: 900000 });
                    res.cookie('pass', o.pass, { maxAge: 900000 });
                }
                res.status(200).send(o);
            }
        });
    });

    // logged-in user homepage //
    app.get('/home', function(req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            var userName = req.session && req.session.user && req.session.user.name;
            AM.getUserSongs(userName, (err, data) => {
                if (err) {
                    //do err handling
                } else {
                    res.render('home', data);
                }
            });
        }
    });

    app.post('/addsongtouser', (req, res) => {
        if(req.session.user == null){
            res.redirect('/');
        } else {
            var userName = req.session.user.name;
            var songName = req.query.songName;
            AM.addSongToUser(userName, songName, (err, result)=>{
                if(err){
                    res.status(400);
                } else {
                    res.status(200).send('ok');
                }
            });
        }
    });

    app.get('/artist', function(req, res) {
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            var query = req.query;
            AM.getAllSongs(query, (err, data) => {
                if (err) {
                    //do err handling
                } else {
                    res.render('artist', { artistName: query.artistName, songData: data });
                }
            })
        }
    });

    app.get('/library', function(req, res) {
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            var query = {};
            AM.getAllSongs(query, (err, data) => {
                if (err) {
                    //do err handling
                } else {
                    res.render('library', { songData: data });
                }
            })
        }
    });

    app.get('/addsong', function(req, res) {
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            res.render('addsong');
        }
    });

    app.post('/addsong', function(req, res) {
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            AM.addNewSong({
                songName: req.body['songName'],
                artistName: req.body['artistName'],
                albumName: req.body['albumName']
            }, function(e, o) {
                if (e) {
                    res.status(400);
                    console.log(e);
                    //show error
                } else {
                    res.status(200).send('ok');
                }
            });
        }
    });

    app.post('/logout', function(req, res) {
        res.clearCookie('user');
        res.clearCookie('pass');
        req.session.destroy(function(e) { res.status(200).send('ok'); });
    })

    // creating new accounts //

    app.get('/signup', function(req, res) {
        res.render('signup', { title: 'Signup' });
    });

    app.post('/signup', function(req, res) {
        AM.addNewAccount({
            name: req.body['name'],
            user: req.body['user'],
            pass: req.body['pass'],
        }, function(e) {
            if (e) {
                res.status(400).send(e);
            } else {
                res.status(200).send('ok');
            }
        });
    });

    app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found' }); });

};