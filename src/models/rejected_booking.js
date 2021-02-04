'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rejected_Booking = sequelize.define('Rejected_Booking', {
    bookingId: DataTypes.INTEGER,
    isRejected: DataTypes.BOOLEAN
  }, {});
  Rejected_Booking.associate = function(models) {
    // associations can be defined here
    Rejected_Booking.belongsTo(models.Vehiclebooking,{
      foreignKey: {
        field: 'bookingId',
      },
      onDelete: 'CASCADE',
    });
  };
  return Rejected_Booking;
};