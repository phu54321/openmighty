var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'openMighty' });
});

router.get('/login', function(req, res) {
    res.render('login', { title: 'openMighty' });
});

module.exports = router;
