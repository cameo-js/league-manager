var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/:id', function (req, res, next) {
  models.Season.findOne({where: {id: req.params.id}}).then(function (season) {
    season.getGames().then(function (games) {
      season.games = games;
      var context = {season: season};
      res.render('season', context);
    });
  });
});

router.get('/:id/games/new', function (req, res, next) {
  models.Season.findOne({where: {id: req.params.id}}).then(function (season) {
    season.getGames().then(function (games) {
      season.games = games;
      var context = {season: season};
      res.render('game_new', context);
    });
  });
});

router.post('/:id/games/new', function (req, res, next) {
  var values = {
    seasonId : req.params.id,
    gameName: req.body.gameName,
    gameType: req.body.gameType,
    numOfPlayers: req.body.numOfPlayers
  };
  models.Game.create(values).complete(function(err, game){
    res.redirect('/seasons/' + game.seasonId + '/games/' + game.id );
  })
});

router.get('/:id/games/:gameId', function (req, res, next) {
  models.Season.findOne({where: {id: req.params.id}}).then(function (season) {
    season.getGames().then(function (games) {
      season.games = games;
      var context = {season: season};

      models.Game.findOne( { where : {seasonId: req.params.id, id: req.params.gameId}}).then(function (game) {
        context.game = game;
        res.render('game', context);
      });

    });
  });
});


router.get('/:id/games/:gameId/standings', function (req, res, next) {
  var standings = {
    standings: [
      {ranking: 1, teamName: 'Arsenal', play: 38, win: 38, draw: 0, lost: 0}
    ]
  };
  res.json(standings);
});


module.exports = router;