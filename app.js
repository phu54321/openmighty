"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');

const cookieSecret = 'kefahdskjjhjkhvihkjbhtkgkjgb';

const app = express();

app.use(logger('dev'));

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(cookieSecret));

// Add req to pug local variable
app.use(function (req, res, next) {
    res.locals.request = req;
    next();
});

////////////////////

app.use(compression());
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
app.use('/', require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));

// catch 404 and forward to error handler
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
    res.render('error');
});


////

app.initSocketIO = function (io) {
    const socketIOCookieParser = require('socket.io-cookie-parser');
    io.use(socketIOCookieParser(cookieSecret));
    require('./src/server/server')(io);
};

module.exports = app;
