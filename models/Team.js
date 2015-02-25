"use strict";

module.exports = function(sequelize, DataTypes) {
  var Team = sequelize.define("Team", {
    teamName : DataTypes.STRING,
    teamEmblem :DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });

  return Team;
};