var models = require('../models');
var express = require('express');
var router = express.Router();
var _ = require("underscore");

/* GET users listing. */
router.get('/', function(req, res, next) {
  models.Team.findAll().complete(function(err, teams){

    selectData = _.map( teams, function( team ){
      return { value : team.id, text : team.teamName };
    });

    console.log( selectData );

    res.json( selectData );
  });
});

module.exports = router;
