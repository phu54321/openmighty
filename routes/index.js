const express = require('express');
const users = require('./users');
let router = express.Router();

/* GET home page. */
router.get('/', users.checkLogon, function(req, res) {
    res.render('index', {title: '방 찾기'});
});

router.get('/:room', users.checkLogon, (req, res) => {
    res.redirect('/');
});
module.exports = router;
