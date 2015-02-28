"use strict";

module.exports = function (sequelize, DataTypes) {
  var Match = sequelize.define("Match", {
    group: {type: DataTypes.STRING, defaultValue: 'A'},
    round: DataTypes.INTEGER,
    status: {type: DataTypes.ENUM, values: ['open', 'close'], defaultValue: 'open'},
    homeScore: DataTypes.INTEGER,
    awayScore: DataTypes.INTEGER,
    review: DataTypes.TEXT,
    reviewerId: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        Match.belongsTo(models.Player, {as: 'homePlayer'});
        Match.belongsTo(models.Player, {as: 'awayPlayer'});
      }
    }
  });

  return Match;
};