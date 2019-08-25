const LocalStrategy = require('passport-local').Strategy
const RememberMeStrategy = require('passport-remember-me').Strategy;
const uuidv1 = require('uuid/v1');
const accessModel = require('../models/access');
const userModel = require('../models/user');
const passport = require('passport')
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

passport.use(new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
        const userResult = await userModel.findOne({ email: username }).exec();
        if (!userResult) { return done(null, false, { message: 'User not found' }); }
        if (!userResult.comparePassword(password, userResult.password)) { return done(null, false, { message: 'Bad password' }); }
        userResult.password = '';
        return done(null, userResult);
    }
));

passport.use(new RememberMeStrategy(
    { usernameField: "email", passwordField: "password" },
    async (token, done) => {
        const userId = await client.get(token);
        if (!userId) { await accessModel.deleteOne({ token }).exec(); return done(null, false); }
        const user = await userModel.findById(userId).exec()
        user['password'] = '';
        delete user['password'];
        return done(null, user);
    },
    issueToken
));

async function issueToken(user, done) {
    var token = uuidv1();
    const existingUser = await accessModel.findOne({ userId: user._id }).exec()
    if (existingUser) {
        return done(null, existingUser.token);
    }
    else {
        const result = await client.set(token, user._id.toString(), 'EX', 200);
        await accessModel.create({ token, userId: user._id }).catch(err => err);
        return done(null, token);
    }
}

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id).exec()
    done(null, user);
});


module.exports = { passport, issueToken };