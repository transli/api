'use strict';
module.exports = (sequelize, DataTypes) => {
  const VehicleAvailabilty = sequelize.define('VehicleAvailabilty', {
    date: DataTypes.JSON
  }, {});
  VehicleAvailabilty.associate = function(models) {
    VehicleAvailabilty.belongsTo(models.Vehicle,{
      foreignKey: {
        name: 'vehicleId',
        field: 'vehicleId',
        allowNull: false,
        constraints: false,
      },
      onDelete: 'CASCADE',
    });
  };
  return VehicleAvailabilty;
};