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
      models.User.belongsToMany(models.Post, {
        through: 'UserLikes',
        foreignKey: 'userId',
        otherKey: 'postId'
      });
      models.Post.belongsToMany(models.User, {
        through: 'UserLikes',
        foreignKey: 'postId',
        otherKey: 'userId'
      });
      models.UserLikes.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      models.UserLikes.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
      });
    }
  };
  UserLikes.init({
    post_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Post',
        key: 'id'
      }
    },
    user_id: {
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