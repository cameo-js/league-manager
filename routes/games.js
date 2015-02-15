var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/new', function (req, res, next) {
  res.render('game_new', {});
});

router.get('/:id', function (req, res, next) {
  res.render('game', {gameId: req.params.id});
});

router.get('/:id/standings', function (req, res, next) {

  var standings = {
    standings: [
      {ranking: 1, teamName: 'Arsenal', play: 38, win: 38, draw: 0, lost: 0}
    ]
  };
  res.json(standings);

});

module.exports = router;