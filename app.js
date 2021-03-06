"use strict";

const express = require('express');
const helmet = require('helmet');
const app = express();
app.use(helmet());


const path = require('path');


/////////////// 1. Basic server setting
// Add logger
const logger = require('./src/logger');
const morgan = require('morgan');
// Since we're using reverse proxy, we should use x-forwarded-for instead if plain remote address.
morgan.token('remote-addr', function (req, res) {
    let ffHeaderValue = req.headers['x-forwarded-for'];
    return ffHeaderValue || req.connection.remoteAddress;
});
app.use(morgan('common', { "stream": logger.stream }));

require('./src/logger');


// Init Pug template engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

app.use(function (req, res, next) {
    // Add req to pug local variable
    res.locals.request = req;
    next();
});


// Body parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Session
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const sessionStore = new RedisStore({
    host: '127.0.0.1',
    port: 6379
});
const SESSION_SECRET = require('./secret.json')

const sessionMiddleware = session({
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    secret: SESSION_SECRET
});

app.use(sessionMiddleware);


// Passport
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


// Compression
const compression = require('compression');
app.use(compression());


////////////////////////////////////////////////////////////////////////////

/////////////// 2. Resources



// Static things
app.use(
    '/images/cards',
    express.static(
        path.join(__dirname, 'public/images/cards'),
        { maxAge: 86400000 }  // 1 day cache
    )
);

app.use(express.static(
    path.join(__dirname, 'public')
));

app.use(
    '/bower_components',
    express.static(
        path.join(__dirname, 'bower_components'))
);


// Routes
const utils = require('./src/utils');
app.use(function (req, res, next) {
    res.locals.formatTime = utils.formatTime;
    next();
});

app.use('/', require('./src/routes/index'));
app.use('/', require('./src/routes/users'));
app.use('/', require('./src/routes/game'));
app.use('/', require('./src/routes/gamelog'));


// 404 Error
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {message: "500"});
    global.logger.error(err);
});


////


// Socket.io is initialized on bin/www.
// We expose initializer function here.
app.initSocketIO = function (io) {
    // Passport
    const passportSocketIo = require("passport.socketio");
    io.use(passportSocketIo.authorize({
        secret: SESSION_SECRET,
        store: sessionStore,
    }));

    // Session
    const sharedsession = require("express-socket.io-session");
    io.use(sharedsession(sessionMiddleware, {autoSave: true}));

    require('./src/server/server')(io);
};

module.exports = app;
