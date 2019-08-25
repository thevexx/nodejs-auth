const router = require('express').Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.send({ message: 'no no no ! unauthorized !' })
}

router.get('/', ensureAuthenticated, function (req, res) {
    res.send({ user: req.user });
});

module.exports = router;
