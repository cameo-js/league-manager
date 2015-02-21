"use strict";

module.exports = function (sequelize, DataTypes) {
  var Match = sequelize.define("Match", {
    group : DataTypes.STRING,
    round : DataTypes.INTEGER,
    homePlayerId : DataTypes.INTEGER,
    awayPlayerId : DataTypes.INTEGER,
    homeScore : DataTypes.INTEGER,
    awayScore : DataTypes.INTEGER,
    review : DataTypes.TEXT,
    reviewerId : DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        Match.belongsTo(models.Game);
      }
    }
  });

  return Match;
};