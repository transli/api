'use strict';
module.exports = (sequelize, DataTypes) => {
  const BasicVehicleDetails = sequelize.define('BasicVehicleDetails', {
    carName: DataTypes.STRING,
    seats: DataTypes.INTEGER,
    doors: DataTypes.INTEGER,
    fuelType: DataTypes.STRING,
    grade: DataTypes.STRING,
    vehicleId: DataTypes.INTEGER
  }, {});
  BasicVehicleDetails.associate = function(models) {
    // associations can be defined here
    BasicVehicleDetails.belongsTo(models.Vehicle, { 
      foreignKey: 'vehicleId' 
    });
  };
  return BasicVehicleDetails;
};