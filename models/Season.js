"use strict";

module.exports = function (sequelize, DataTypes) {
  var Season = sequelize.define("Season", {
    seasonName: {type: DataTypes.STRING, allowNull: false},
    closedAt: {type: DataTypes.DATE},
    status: {type: DataTypes.ENUM, values: ['open', 'close'], defaultValue : 'open' }
  }, {
    createdAt: 'startedAt',
    updatedAt: false,
    classMethods: {
      associate: function (models) {
        Season.hasMany(models.Game, { foreignKey: 'seasonId' } );
      }
    }
  });
  return Season;
};