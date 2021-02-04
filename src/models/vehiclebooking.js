'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vehiclebooking = sequelize.define('Vehiclebooking', {
    tripStart: DataTypes.STRING,
    tripEnd: DataTypes.STRING,
    mPesaNumber: DataTypes.STRING,
    days: DataTypes.FLOAT,
    ownerId: DataTypes.INTEGER,
    picRetLo: DataTypes.JSON,
    vehicleData: DataTypes.JSON,
    pending: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    mpesaReceiptNumber: DataTypes.STRING
  }, {});
  Vehiclebooking.associate = function(models) {
    Vehiclebooking.belongsTo(models.User,{
      onDelete: 'CASCADE',
        foreignKey: {
          name: 'userId',
          field: 'userId',
          allowNull: false,
          constraints: false,
        }
    });
    Vehiclebooking.belongsTo(models.Vehicle,{
        foreignKey: {
          field: 'vehicleId',
        },
        onDelete: 'CASCADE',
    });
    Vehiclebooking.hasOne(models.Cancelled_Booking,{
      foreignKey: {
        field: 'bookingId',
      },
      onDelete: 'CASCADE',
    });
    Vehiclebooking.hasOne(models.Rejected_Booking,{
      foreignKey: {
        field: 'bookingId',
      },
      onDelete: 'CASCADE',
    });
  }
  return Vehiclebooking;
};