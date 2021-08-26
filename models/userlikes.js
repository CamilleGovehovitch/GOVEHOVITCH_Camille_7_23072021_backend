'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLikes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      // define association here
      this.user = models.UserLikes.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      this.post = models.UserLikes.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
      });
    }
  };
  UserLikes.init({
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Post',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'id'
        }
    }
  }, {
    sequelize,
    modelName: 'UserLikes',
  });
  return UserLikes;
};