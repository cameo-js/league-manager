var models = require('../models');
var express = require('express');
var router = express.Router();
var wt_sender = require('../modules/wt_sender');

var _ = require("underscore");
var format = require('string-format')

router.get('/:gameId/standings', function (req, res, next) {
  models.sequelize.query(format(standingsQuery, {gameId: req.params.gameId})).complete(function (err, rows) {
    res.json({standings: rows[0]})
  });
});

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
      updatedAt: null,
      status: 'open'
    };
    match.update(values).complete(function (err, player) {
      res.json({status: 200, success: true, type: 'success', message: 'success to update'});
    });
  });
});

/* query */

/* standings query
 select z1.* , z1.win*3 + z1.draw points
 from (
 select s1.playerId, s1.playerName, sum(played) played,
 sum(win) win,
 sum(draw) draw,
 sum(lost) lost,
 sum(for) for,
 sum(against) against
 from (
 select t1.id playerId, t1.playerName, 1 played,
 case when t2.homeScore > t2.awayScore then 1 else 0 end win,
 case when t2.homeScore = t2.awayScore then 1 else 0 end draw,
 case when t2.homeScore < t2.awayScore then 1 else 0 end lost,
 ifnull(t2.homeScore, 0) for, ifnull(t2.awayScore, 0 ) against
 from Players t1 join Matches t2 on ( t1.id = t2.homePlayerId )
 where
 t1.gameId = 1
 and t2.status = 'close'
 union all
 select t1.id playerId, t1.playerName, 0 played,
 0 win,
 0 draw,
 0 lost,
 ifnull(t2.homeScore, 0) for, ifnull(t2.awayScore, 0 ) against
 from Players t1 join Matches t2 on ( t1.id = t2.homePlayerId )
 where
 t1.gameId = 1
 and t2.status = 'open'
 union all
 select t1.id playerId, t1.playerName, 1 played,
 case when t2.homeScore < t2.awayScore then 1 else 0 end win,
 case when t2.homeScore = t2.awayScore then 1 else 0 end draw,
 case when t2.homeScore > t2.awayScore then 1 else 0 end lost,
 ifnull(t2.awayScore, 0) for, ifnull(t2.homeScore, 0 ) against
 from Players t1 join Matches t2 on ( t1.id = t2.awayPlayerId )
 where
 t1.gameId = 1
 and t2.status = 'close'
 ) s1 group by s1.playerId, s1.playerName
 ) z1 order by z1.win*3+z1.draw desc
 */
var standingsQuery = "select z1.* , z1.win*3 + z1.draw points, (z1.win*3+z1.draw)*1000 + (z1.for-z1.against)*100 weight, \n" +
    "\tteamId, ( select teamName from Teams where id = z1.teamId ) teamName, ( select teamEmblem from Teams where id = z1.teamId ) teamEmblem\n" +
    "from (\n" +
    "\tselect s1.playerId, s1.playerName, sum(played) played , teamId,\n" +
    "\t\tsum(win) win,\n" +
    "\t\tsum(draw) draw,\n" +
    "\t\tsum(lost) lost,\n" +
    "\t\tsum(for) for,\n" +
    "\t\tsum(against) against\n" +
    "\tfrom (\n" +
    "\t\tselect t1.id playerId, t1.playerName, 1 played,  t1.teamId,\n" +
    "\t\t\tcase when t2.homeScore > t2.awayScore then 1 else 0 end win, \n" +
    "\t\t\tcase when t2.homeScore = t2.awayScore then 1 else 0 end draw, \n" +
    "\t\t\tcase when t2.homeScore < t2.awayScore then 1 else 0 end lost, \n" +
    "\t\t\tifnull(t2.homeScore, 0) for, ifnull(t2.awayScore, 0 ) against\n" +
    "\t\tfrom Players t1 join Matches t2 on ( t1.id = t2.homePlayerId )\n" +
    "\t\twhere\n" +
    "\t\t\tt1.gameId = {gameId}\n" +
    "\t\t\tand t2.status = 'close'\n" +
    "\t\tunion all\n" +
    "\t\tselect t1.id playerId, t1.playerName, 0 played,  t1.teamId,\n" +
    "\t\t\t0 win, \n" +
    "\t\t\t0 draw, \n" +
    "\t\t\t0 lost, \n" +
    "\t\t\tifnull(t2.homeScore, 0) for, ifnull(t2.awayScore, 0 ) against\n" +
    "\t\tfrom Players t1 join Matches t2 on ( t1.id = t2.homePlayerId )\n" +
    "\t\twhere\n" +
    "\t\t\tt1.gameId = {gameId}\n" +
    "\t\t\tand t2.status = 'open'\n" +
    "\t\tunion all\n" +
    "\t\tselect t1.id playerId, t1.playerName, 1 played,  t1.teamId,\n" +
    "\t\t\tcase when t2.homeScore < t2.awayScore then 1 else 0 end win, \n" +
    "\t\t\tcase when t2.homeScore = t2.awayScore then 1 else 0 end draw, \n" +
    "\t\t\tcase when t2.homeScore > t2.awayScore then 1 else 0 end lost, \n" +
    "\t\t\tifnull(t2.awayScore, 0) for, ifnull(t2.homeScore, 0 ) against\n" +
    "\t\tfrom Players t1 join Matches t2 on ( t1.id = t2.awayPlayerId )\n" +
    "\t\twhere\n" +
    "\t\t\tt1.gameId = {gameId}\n" +
    "\t\t\tand t2.status = 'close'\n" +
    "\t) s1 group by s1.playerId, s1.playerName\n" +
    ") z1 order by (z1.win*3+z1.draw)*1000 + (z1.for-z1.against)*100 desc";

module.exports = router;
