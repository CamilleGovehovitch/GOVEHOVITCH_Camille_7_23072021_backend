"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      // models.Post.belongsTo(models.Post, {
      //   foreignKey: {
      //     allowNull: true,
      //   }, 
      // });
      this.user = models.Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      this.likes = models.Post.hasMany(models.UserLikes, {
        foreignKey: 'postId',
        as: 'likes'
      });
      this.dislikes = models.Post.hasMany(models.UserDislikes, {
        foreignKey: 'postId',
        as: 'dislikes'
      });
    }
  }
  Post.init(
    {
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      attachement: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
