'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDislikes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      // define association here
      models.User.belongsToMany(models.Post, {
        through: 'UserDislikes',
        foreignKey: 'userId',
        otherKey: 'postId'
      });
      models.Post.belongsToMany(models.User, {
        through: 'UserDislikes',
        foreignKey: 'postId',
        otherKey: 'userId'
      });
      models.UserDislikes.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      models.UserDislikes.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
      });
    }
  };
  UserDislikes.init({
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
  }, 
{
    sequelize,
    modelName: 'UserDislikes',
  });
  return UserDislikes;
};