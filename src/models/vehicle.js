'use strict';

const uuidv4 = require('uuid/v4');

module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    vuuid: DataTypes.STRING,
    model: DataTypes.STRING,
    make: DataTypes.STRING,
    year: DataTypes.STRING,
    vehicleType: DataTypes.STRING,
    transmission: DataTypes.STRING,
    price: DataTypes.INTEGER,
    pickUpDropOffLocation: DataTypes.JSON,
    carAvailability: DataTypes.JSON,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    carDetails: DataTypes.TEXT,
    millage: DataTypes.STRING,
    features: DataTypes.JSON,
    numberPlate: DataTypes.STRING,
    isbooked: DataTypes.BOOLEAN,
    with_driver: DataTypes.BOOLEAN,
    checked: DataTypes.BOOLEAN,
    loactionName: DataTypes.STRING,
  }, {
    hooks: {
      afterValidate: async (v) => {
        v.vuuid = uuidv4();
      },
    },
  });
  Vehicle.associate = (models) => {
    // associations can be defined here
    Vehicle.belongsTo(models.User, { 
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'userId',
        field: 'userId',
        allowNull: false,
        constraints: false,
      },
    });
    Vehicle.hasMany(models.Reviews);
    Vehicle.hasMany(models.VehicleImages, {
      foreignKey: 'vehicleId'
    });
    Vehicle.hasMany(models.Vehiclebooking, {
      foreignKey: 'vehicleId'
    });
    Vehicle.hasMany(models.Booking);
    Vehicle.hasMany(models.VehicleAvailabilty);
    
    Vehicle.hasOne(models.BasicVehicleDetails,{
      foreignKey: 'vehicleId'
    });
    Vehicle.hasOne(models.VehicleGuideline,{
      foreignKey: 'vehicleId'
    });
  };
  return Vehicle;
};