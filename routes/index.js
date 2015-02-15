var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('season', { title: 'daumkakao winning group' });
});

module.exports = router;