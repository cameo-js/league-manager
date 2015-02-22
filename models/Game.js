"use strict";

module.exports = function (sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    gameName: {type: DataTypes.STRING},
    gameType: {type: DataTypes.ENUM, values: ['full-league', 'tournament'], defaultValue: 'full-league'},
    numOfPlayers: {type: DataTypes.INTEGER}
  }, {
    updatedAt: false,
    classMethods: {
      associate: function (models) {
        Game.hasMany(models.Player, { foreignKey : 'gameId' });
      }
    }
  });

  return Game;
};