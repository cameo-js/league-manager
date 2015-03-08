var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/match', function( req, res, next ){
  models.Match.findOne( {
    where : { id : req.query.matchId }
  }).complete(function( err, match ){
    match.getComments({ include :[{all:true}]}).then( function( comments ){
      res.json({ comments : comments });
    });
  });
});

router.post('/', function( req, res, next ){
  models.Comment.create({
    writerId : req.body.writerId,
    writerName : req.body.writerName,
    writerProfileImg : req.body.writerProfileImg,
    content : req.body.content,
    matchId : req.body.matchId,
    gameId : req.body.gameId
  }).complete( function( err, comment ){
    res.json({ success: true, comment : comment });
  });
});

router.delete('/', function( req, res, next ){
  //console.log( req.body );
  models.Comment.destroy({
    where : { id : req.body.commentId }
  }).complete( function( err, comment ){
    res.json({ success: true });
  });
})

module.exports = router;