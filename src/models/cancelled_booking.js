'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cancelled_Booking = sequelize.define('Cancelled_Booking', {
    bookingId: DataTypes.INTEGER,
    isCancelled: DataTypes.BOOLEAN
  }, {});
  Cancelled_Booking.associate = function(models) {
    // associations can be defined here
    Cancelled_Booking.belongsTo(models.Vehiclebooking,{
      foreignKey: {
        field: 'bookingId',
      },
      onDelete: 'CASCADE',
    });
  };
  return Cancelled_Booking;
};