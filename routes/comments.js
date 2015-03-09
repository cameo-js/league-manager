var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function( req, res, next ){
  var offset = req.params.offset || 0;
  var limit = req.params.limit || 25;
  models.Comment.findAll({ include:[ {all:true} ], order: [['createdAt', 'DESC']], offset: offset, limit: limit }).then(
      function( comments ){
        res.json( { comments : comments });
      }
  );
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

router.get('/match', function( req, res, next ){
  models.Match.findOne( {
    where : { id : req.query.matchId }
  }).complete(function( err, match ){
    match.getComments({ include :[{all:true}]}).then( function( comments ){
      res.json({ comments : comments });
    });
  });
});



module.exports = router;