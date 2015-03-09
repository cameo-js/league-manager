var models = require('../models');
var express = require('express');
var router = express.Router();
var wt_sender = require('../modules/wt_sender');

router.post('/:gameId/players/:playerId', function (req, res, next) {
  models.Player.findOne({where: {id: req.body.pk}}).complete(function (err, player) {

    var values = {};
    values[req.body.name] = req.body.value;
    player.update(values).complete(function (err, player) {
      res.json({status: 200, success: true, message: 'success to update', player: player});
    });
  });
});

router.post('/:gameId/matches/:matchId', function (req, res, next) {
  models.Match.findOne({where: {id: req.params.matchId}, include: [{all: true, include: [{all: true}]}]}).complete(function (err, match) {
    //console.log( req.body['value[homeScore]'] );
    var values = {
      homeScore: req.body['value[homeScore]'],
      awayScore: req.body['value[awayScore]'],
      status: 'close'
    };

    match.update(values).complete(function (err, match) {
      models.Game.findOne({where: {id: match.gameId}, include: [{all: true}]}).complete(function (err, game) {
        var msg = game.gameName + ': ' + match.round + ' 라운드 경기결과\n' +
            match.homePlayer.team.teamName + '(' + match.homePlayer.playerName + ') vs ' + match.awayPlayer.team.teamName + '(' + match.awayPlayer.playerName + ')\n' +
            match.homeScore + ' : ' + match.awayScore + '\n' +
            'http://lemon.daumtools.com/seasons/' + game.seasonId + '/games/' + req.params.gameId + '/matches/' + req.params.matchId;
        wt_sender.send('lemon', msg);
        res.json({status: 200, success: true, message: 'success to update match', values: values});
      })
    });
  });
});

router.post('/:gameId/matches/:matchId/reset', function (req, res, next) {
  models.Match.findOne({where: {id: req.params.matchId}}).complete(function (err, match) {
    var values = {
      homeScore: null,
      awayScore: null,
      status: 'open'
    };
    match.update(values).complete(function (err, player) {
      res.json({status: 200, success: true, type: 'success', message: 'success to update'});
    });
  });
});

module.exports = router;
