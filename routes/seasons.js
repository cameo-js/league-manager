var models = require('../models');
var express = require('express');
var router = express.Router();

var _ = require("underscore");
var format = require('string-format')

router.get('/:id', function (req, res, next) {
  models.Season.findOne({where: {id: req.params.id}}).then(function (season) {
    season.getGames().then(function (games) {
      var context = {season: season};
      season.games = games;
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
    seasonId: req.params.id,
    gameName: req.body.gameName,
    gameType: req.body.gameType,
    numOfPlayers: req.body.numOfPlayers
  };
  models.Game.create(values).complete(function (err, game) {
    /*
     TODO 현재는 gameType 에 상관없이 full-league type 으로 생성한다. 향후 gameType 에 맞는 Match 가 생성될 수 있도록 MatchScheduler 를 다양하게 만들어야 한다.
     */

    for (var loop = 1; loop < game.numOfPlayers; loop++) {
      models.Player.create({gameId: game.id, playerName: 'noname-' + loop});
    }
    models.Player.create({gameId: game.id, playerName: 'noname-' + game.numOfPlayers}).complete(function (err, player) {
      game.getPlayers().then(function (players) {
        /*
         full league schedule 만드는 방법 ( http://www.cutoutfoldup.com/1302-how-to-schedule-soccer-games.php )

         1. match pair 생성. schedule circle 의 index 쌍. [ home, away ]
         2. match pair 는 각 pair 의 distance 가 같지 않도록 구성한다. 위 레퍼런스 참고
         2. match pair 는 고정된 값이며 schedule circle ( circuler queue 처럼 동작 ) 를 다이얼 돌리듯이 한칸씩 돌린(round) 후 match pair 로 match 추출
         */

        // 일반리그는 모두 'A' group 하나만 존재하는 리그이다.
        // TODO 조별리그타입일 경우에는 조별로 group 값을 다르게 할당하도록 한다.
        var matches = [];     // models.Match.create( matches[?] )

        var numOfPlayers = players.length;
        var firstHalfMatchPair = [];
        var secondHalfMatchPair = [];

        // match pair 생성
        for( var i = 0 ; i < numOfPlayers/2 ; i++ ){
          if( i === 0 ){
            firstHalfMatchPair.push( [ i, -1 ] );
            secondHalfMatchPair.push( [ -1, i ]);
          } else {
            firstHalfMatchPair.push( [ i, numOfPlayers-(i+1) ] );
            secondHalfMatchPair.push( [ numOfPlayers-(i+1), i ]);
          }
        }

        // console.log( firstHalfMatchPair );
        // console.log( secondHalfMatchPair );

        var scheduleCircle = _.map( players, function( player ){
          return player.id
        });
        var scheduleCenter = scheduleCircle[numOfPlayers-1];
        scheduleCircle = _.initial( scheduleCircle );

        console.log( scheduleCircle ) ;

        var schedules = [];
        var totalRounds = numOfPlayers * 2 - 2;
        var turn = totalRounds / 2;

        var matches = [];
        var round = 1;

        var firstHalfRound1 = _.map( firstHalfMatchPair, function( pair ){
          var homePlayer = scheduleCircle[pair[0]];
          var awayPlayer = pair[1] < 0 ? scheduleCenter : scheduleCircle[pair[1]];
          return { round: round, homePlayerId : homePlayer, awayPlayerId : awayPlayer };
        })
        _.each( firstHalfRound1, function( match ){
          matches.push( match );
        });

        var secondHalfRound1 = _.map( secondHalfMatchPair, function( pair ){
          var homePlayer = pair[0] < 0 ? scheduleCenter : scheduleCircle[pair[0]];
          var awayPlayer = scheduleCircle[pair[1]];
          return { round: round+turn, homePlayerId: homePlayer, awayPlayerId: awayPlayer };
        })
        _.each( secondHalfRound1, function( match ){
          matches.push( match );
        });

        var last = numOfPlayers-2; // last index of circle

        round++;
        for( ; round <= turn ; round++ ){
          //console.log( scheduleCircle );
          //console.log( scheduleCircle[last] );

          // right shift and last item insert to 0 index
          // circle 을 시계방향으로 한번 돌린다.
          scheduleCircle.splice(0, 0, scheduleCircle[last]);
          scheduleCircle = _.initial( scheduleCircle );

          var firstHalfRounds = _.map( firstHalfMatchPair, function( pair ){
            var homePlayer = scheduleCircle[pair[0]];
            var awayPlayer = pair[1] < 0 ? scheduleCenter : scheduleCircle[pair[1]];
            return { round: round, homePlayerId : homePlayer, awayPlayerId : awayPlayer };
          })
          _.each( firstHalfRounds, function( match ){
            matches.push( match );
          });

          //console.log( scheduleCircle );
          //console.log( scheduleCircle[last] );
          //console.log( first );

          var secondHalfRounds = _.map( secondHalfMatchPair, function( pair ){
            var homePlayer = pair[0] < 0 ? scheduleCenter : scheduleCircle[pair[0]];
            var awayPlayer = scheduleCircle[pair[1]];
            return { round: round+turn, homePlayerId: homePlayer, awayPlayerId: awayPlayer };
          })
          _.each( secondHalfRounds, function( match ){
            matches.push( match );
          });
        }

        _.each( matches, function( values ){
          models.Match.create( values ).complete( function( err, match ){
            game.addMatch( match );
          });
        })

      });
    });

    res.redirect('/seasons/' + game.seasonId + '/games/' + game.id);
  })
});

router.get('/:id/games/:gameId', function (req, res, next) {
  models.Season.findOne({where: {id: req.params.id}}).then(function (season) {
    season.getGames().then(function (games) {
      season.games = games;
      var context = {season: season};

      models.Game.findOne({where: {seasonId: req.params.id, id: req.params.gameId}}).then(function (game) {
        context.game = game;
        res.render('game', context);
      });
    });
  });
});

router.get('/:id/games/:gameId/settings/players', function (req, res, next) {
  models.Season.findOne({where: {id: req.params.id}}).then(function (season) {
    season.getGames().then(function (games) {
      season.games = games;
      var context = {season: season};

      models.Game.findOne({where: {seasonId: req.params.id, id: req.params.gameId}}).then(function (game) {
        context.game = game;
        game.getPlayers({ include : [ {all:true} ] }).then( function ( players ){
          context.players = players;
          res.render('game_settings_players', context );
        })
      });

    });
  });
});

router.get('/:id/games/:gameId/matches_and_schedule', function (req, res, next) {
  models.Game.findOne( { where : { id : req.params.gameId }}).complete( function( err, game ){
    game.getMatches({ include: [{ all: true }], order : 'round' }).then( function( matches ){
      res.json( { matches : matches } );
    })
  });
});

router.get('/:id/games/:gameId/standings', function (req, res, next) {

  models.sequelize.query(format(standingsQuery,{ gameId : req.params.gameId })).complete( function( err, rows ){
    //if( err ) console.log( err );
    //console.log( rows );
    res.json( { standings : rows[0] } )
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
var standingsQuery = "select z1.* , z1.win*3 + z1.draw points\n" +
    "from (\n" +
    "\tselect s1.playerId, s1.playerName, sum(played) played,\n" +
    "\t\tsum(win) win,\n" +
    "\t\tsum(draw) draw,\n" +
    "\t\tsum(lost) lost,\n" +
    "\t\tsum(for) for,\n" +
    "\t\tsum(against) against\n" +
    "\tfrom (\n" +
    "\t\tselect t1.id playerId, t1.playerName, 1 played, \n" +
    "\t\t\tcase when t2.homeScore > t2.awayScore then 1 else 0 end win, \n" +
    "\t\t\tcase when t2.homeScore = t2.awayScore then 1 else 0 end draw, \n" +
    "\t\t\tcase when t2.homeScore < t2.awayScore then 1 else 0 end lost, \n" +
    "\t\t\tifnull(t2.homeScore, 0) for, ifnull(t2.awayScore, 0 ) against\n" +
    "\t\tfrom Players t1 join Matches t2 on ( t1.id = t2.homePlayerId )\n" +
    "\t\twhere\n" +
    "\t\t\tt1.gameId = {gameId}\n" +
    "\t\t\tand t2.status = 'close'\n" +
    "\t\tunion all\n" +
    "\t\tselect t1.id playerId, t1.playerName, 0 played, \n" +
    "\t\t\t0 win, \n" +
    "\t\t\t0 draw, \n" +
    "\t\t\t0 lost, \n" +
    "\t\t\tifnull(t2.homeScore, 0) for, ifnull(t2.awayScore, 0 ) against\n" +
    "\t\tfrom Players t1 join Matches t2 on ( t1.id = t2.homePlayerId )\n" +
    "\t\twhere\n" +
    "\t\t\tt1.gameId = {gameId}\n" +
    "\t\t\tand t2.status = 'open'\n" +
    "\t\tunion all\n" +
    "\t\tselect t1.id playerId, t1.playerName, 1 played, \n" +
    "\t\t\tcase when t2.homeScore < t2.awayScore then 1 else 0 end win, \n" +
    "\t\t\tcase when t2.homeScore = t2.awayScore then 1 else 0 end draw, \n" +
    "\t\t\tcase when t2.homeScore > t2.awayScore then 1 else 0 end lost, \n" +
    "\t\t\tifnull(t2.awayScore, 0) for, ifnull(t2.homeScore, 0 ) against\n" +
    "\t\tfrom Players t1 join Matches t2 on ( t1.id = t2.awayPlayerId )\n" +
    "\t\twhere\n" +
    "\t\t\tt1.gameId = {gameId}\n" +
    "\t\t\tand t2.status = 'close'\n" +
    "\t) s1 group by s1.playerId, s1.playerName\n" +
    ") z1 order by z1.win*3+z1.draw desc";

module.exports = router;