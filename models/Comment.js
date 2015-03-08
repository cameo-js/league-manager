/**
 * Created by sehan on 15. 3. 7..
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {
    writerId: DataTypes.STRING,
    writerName: DataTypes.STRING,
    writerProfileImg: DataTypes.STRING,
    content: DataTypes.STRING,
    commentType: {type: DataTypes.ENUM, values: ['reply', 'review'], defaultValue: 'reply'}
  }, {
    classMethods: {
      associate: function (models) {
        Comment.belongsTo(models.Match, {as: 'match'});
        Comment.belongsTo(models.Game, {as: 'game'});
      }
    }
  });

  return Comment;
};