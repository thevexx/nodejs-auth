const router = require('express').Router();

const userModel = require('../models/user');
const accessModel = require('../models/access');

const passport = require('../passport/passport.module').passport;
const issueToken = require('../passport/passport.module').issueToken;

router.post('/login',
    passport.authenticate('local'),
    (req, res, next) => {
        if (!req.body.remember_me) { return next(); }
        issueToken(req.user, function (err, token) {
            if (err) { return next(err); }
            res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
            return next();
        });
    },
    (req, res) => {
        res.send(req.user);
    });

router.get('/logout', function (req, res) {
    res.clearCookie('remember_me');
    req.logout();
    res.redirect('/');
});

router.post('/register', async (req, res) => {
    const userResult = await userModel.create(req.body).catch(err => err);
    res.send({ msg: 'user Creation', data: userResult })
})

module.exports = router;
