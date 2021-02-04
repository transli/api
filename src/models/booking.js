'use strict';
const uuidv4 = require('uuid/v4');
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    bookingUuid: DataTypes.STRING,
    bookingId: DataTypes.INTEGER,
    tripStart: DataTypes.STRING,
    tripEnd: DataTypes.STRING,
    amntPerday: DataTypes.INTEGER,
    totalAmnt: DataTypes.INTEGER,
    pickUpDropOffLocation: DataTypes.STRING,
    cancellation: DataTypes.STRING,
    isCanceled: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN
  }, {
    hooks: {
      afterValidate: async(booking) => {
        booking.bookingUuid = uuidv4();
      }
    }
  });
  Booking.associate = function(models) {
    // associations can be defined here
    Booking.belongsTo(models.Vehicle, {
      foreignKey: {
        name: 'vehicleId',
        field: 'vehicleId',
        allowNull: false,
        constraints: false,
      },
    });

  };
  return Booking;
};