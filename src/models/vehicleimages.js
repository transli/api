'use strict';
module.exports = (sequelize, DataTypes) => {
  const VehicleImages = sequelize.define('VehicleImages', {
    imgUrl: DataTypes.STRING
  }, {
    // Hooks
  });

  VehicleImages.associate = (models) => {
    // associations can be defined here
    VehicleImages.belongsTo(models.Vehicle, { 
      foreignKey: 'vehicleId' 
    });

  };
  return VehicleImages;
};