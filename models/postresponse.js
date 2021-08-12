'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.PostResponse.belongsTo(models.Post, {
        foreignKey: {
          allowNull: true,
        }
      });
      models.PostResponse.belongsTo(models.User, {
        foreignKey: {
          allowNull: false
        }
      });
    }
  };
  PostResponse.init({
    parentPostId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PostResponse',
  });
  return PostResponse;
};