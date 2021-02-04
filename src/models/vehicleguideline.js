'use strict';
module.exports = (sequelize, DataTypes) => {
  const VehicleGuideline = sequelize.define('VehicleGuideline', {
    guideline: DataTypes.STRING,
    vehicleId: DataTypes.INTEGER
  }, {});
  VehicleGuideline.associate = function(models) {
    // associations can be defined here
    VehicleGuideline.belongsTo(models.Vehicle, { 
      foreignKey: 'vehicleId' 
    });
  };
  return VehicleGuideline;
};