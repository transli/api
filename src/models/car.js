'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Car extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Car.hasMany(models.Trip,{
        foreignKey: 'car_id',
        onDelete: 'CASCADE'
      });

      Car.belongsTo(models.User,{
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });

      Car.hasOne(models.Car_feature,{
        foreignKey: 'car_id',
      });

      Car.hasOne(models.Car_insurance,{
        foreignKey: 'car_id',
      });
    };
  };
  Car.init({
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    year: DataTypes.INTEGER,
    number_plate: DataTypes.STRING,
    img_url: DataTypes.STRING,
    color: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Car',
  });
  return Car;
};