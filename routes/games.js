var models = require('../models');
var express = require('express');
var router = express.Router();


router.put('/:gameId/players/:playerId', function(req, res, next) {
  models.Player.findOne( { where: {id: req.body.pk }}).complete( function( err, player){

    var values = {};
    values[req.body.name] = req.body.value ;
    console.log( values );
    player.update( values).complete( function( err, player ){
      res.json({ status: 200, success: true, message : 'success to update'} );
    });
  });

});


module.exports = router;
