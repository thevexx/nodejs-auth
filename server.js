const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('./passport/passport.module').passport;
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const session = require('express-session')

const app = express();

mongoose.connect('mongodb://localhost:27017/nodeAuthDb', { useNewUrlParser: true, useCreateIndex: true })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(methodOverride())

const auth = require('./routes/auth');
app.use('/auth', auth);
 
const home = require('./routes/home');
app.use('/home', home);

app.listen(3000, (err) => {
    if (err) throw err;
    console.log('server is listening on port 3000')
})