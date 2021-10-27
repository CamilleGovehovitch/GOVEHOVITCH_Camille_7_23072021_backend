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
      this.user = models.Post.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      this.likes = models.Post.hasMany(models.UserLikes, {
        foreignKey: "postId",
        as: "likes",
        onDelete: "cascade",
        hooks: true,
      });
      this.dislikes = models.Post.hasMany(models.UserDislikes, {
        foreignKey: "postId",
        as: "dislikes",
        onDelete: "cascade",
        hooks: true,
      });
      this.comment = models.Post.hasMany(models.Comment, {
        as: "comment",
        foreignKey: "postId",
        onDelete: "cascade",
        hooks: true,
      });
    }
  }
  Post.init(
    {
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      attachement: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
