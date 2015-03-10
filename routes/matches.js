var models = require('../models');
var express = require('express');
var router = express.Router();

var _ = require("underscore");

router.get('/recent', function (req, res, next) {
  models.Game.findOne({where: {id: req.query.gameId}}).complete(function (err, game) {
    var context = {
      game : game
    };
    
    // 최근 완료된 3경기의 round matches 를 가져온다.
    var numOfPlayers = game.dataValues.numOfPlayers;
    var recent = numOfPlayers/2;
    var roundSize = numOfPlayers/2;
    game.getMatches({ where : { status : 'close' }, order : [['updatedAt', 'DESC']], offset: 0, limit: recent}).then( function( recentMatches ){
      console.log( recentMatches.length );
      var rounds = [];
      if( recentMatches.length == 0 )
        rounds.push(1);
      else {
        var beforeRound = 0;
        _.each(recentMatches, function (match, idx, list) {
          if( _.indexOf( rounds, match.dataValues.round ) < 0 ){
            rounds.push(match.dataValues.round);
          }
        });
        if( rounds.length == 1 && recentMatches.length == roundSize )
          rounds.push( rounds[0] + 1 );
      }
      console.log( rounds );
      models.Match.findAll( { 
        include: [{all: true, include: [{all: true}]}], 
        where : { gameId: req.query.gameId, round : rounds }, 
        order : [['round', 'DESC']]
      }).then( function(matches){
        context.matches = matches;
        res.json(context);
      })
    });

    //game.getMatches({include: [{all: true, include: [{all: true}]}], order: 'Match.round'}).then(function (matches) {
    //  context.matches = matches;
    //  res.json(context);
    //});
  });
});

module.exports = router;
