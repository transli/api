'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Car_feature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Car_feature.belongsTo(models.Car,{
        foreignKey: 'car_id',
        onDelete: 'CASCADE'
      });
    }
  };
  Car_feature.init({
    features: DataTypes.JSON,
    seats: DataTypes.INTEGER,
    doors: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Car_feature',
  });
  return Car_feature;
};