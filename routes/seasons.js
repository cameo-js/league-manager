var models  = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
  models.Season.findOne({ where : { id : req.params.id }}).then(function( season ){
    models.Game.findAll({ where : { SeasonId: req.params.id}}).then(function( games ) {
      res.render('season', { season : season, games : games } );
    });
  });
});



module.exports = router;