'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Rating.belongsTo(models.User, {
        foreignKey: {
          name: 'to_user_id',
          field: 'to_user_id',
        },
        hooks: true,
        onDelete: 'CASCADE'
      });
      User_Rating.belongsTo(models.User, {
        as: 'ratedBy',
        foreignKey: {
          name: 'by_user_id',
          field: 'by_user_id',
        },
        hooks: true,
        onDelete: 'CASCADE'
      });
    }
  };
  User_Rating.init({
    // by_user_id: DataTypes.INTEGER,
    stars: DataTypes.INTEGER,
    review: DataTypes.STRING,
    recomended: DataTypes.ENUM('YES', 'NO'),
    lift_id: DataTypes.INTEGER,
    evaluation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User_Rating',
  });
  return User_Rating;
};