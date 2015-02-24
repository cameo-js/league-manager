"use strict";

module.exports = function(sequelize, DataTypes) {
  var Player = sequelize.define("Player", {
    playerName : DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Player.belongsTo(models.Team);
      }
    }
  });

  return Player;
};