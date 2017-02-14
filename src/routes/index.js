const express = require('express');
const crypto = require('crypto');
const users = require('../routes/users');

let router = express.Router();
module.exports = router;

// Intro page
router.get('/', users.checkLogon, function(req, res) {
    res.render('index', {title: '방 찾기'});
});

