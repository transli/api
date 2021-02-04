'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Car_insurance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Car_insurance.belongsTo(models.Car,{
        foreignKey: 'car_id',
        onDelete: 'CASCADE'
      });
    }
  };
  Car_insurance.init({
    insurance_exp_date: DataTypes.DATE,
    insurance_stiker_img_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Car_insurance',
  });
  return Car_insurance;
};