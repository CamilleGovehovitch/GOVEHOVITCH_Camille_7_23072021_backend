"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.posts = models.User.hasMany(models.Post, {
        as: "posts",
        foreignKey: "userId",
        onDelete: "cascade",
        hooks: true
      });
      this.like = models.User.hasMany(models.UserLikes, {
        as: "likes",
        foreignKey: "userId",
        onDelete: "cascade",
        hooks: true
      });
      this.dislike = models.User.hasMany(models.UserDislikes, {
        as: "dislikes",
        foreignKey: "userId",
        onDelete: "cascade",
        hooks: true
      });
      this.comment = models.User.hasMany(models.Comment, {
        as: "comment",
        foreignKey: "userId",
        onDelete: "cascade",
        hooks: true
      });
     
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      bio: DataTypes.STRING,
      is_admin: DataTypes.BOOLEAN,
      attachement: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
