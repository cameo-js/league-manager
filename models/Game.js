"use strict";

module.exports = function (sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    gameName: {type: DataTypes.STRING},
    gameType: {type: DataTypes.ENUM, values: ['full-league', 'tournament'], defaultValue: 'full-league'},
    numOfTeams: {type: DataTypes.INTEGER}
  }, {
    updatedAt: false,
    classMethods: {
      associate: function (models) {
        Game.belongsTo(models.Season);
        Game.hasMany(models.Match);
        Game.hasMany(models.Player);
      }
    }
  });

  return Game;
};