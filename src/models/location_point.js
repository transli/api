'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location_point extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location_point.belongsTo(models.Trip,{
        foreignKey: 'trip_id',
        onDelete: 'CASCADE',
      });
    }
  };
  Location_point.init({
    pickup_location: DataTypes.JSON,
    dropoff_location: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Location_point',
  });
  return Location_point;
};