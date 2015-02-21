var models  = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Season.findOne({ where : { states : 'open' }}).then(function( row ){
    res.redirect('/seasons/' + row.dataValues.id );
  });
});

module.exports = router;