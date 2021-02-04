'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trips_booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Trips_booking.belongsTo(models.Trip,{
        foreignKey: 'trip_id',
        onDelete: 'CASCADE',
        hooks: true,
      });
      Trips_booking.belongsTo(models.User,{
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        hooks: true,
      });
      Trips_booking.belongsTo(models.User,{
        as: 'liftOwner',
        foreignKey: 'lift_owner_id',
        onDelete: 'CASCADE',
        hooks: true,
      });
    }
  };
  Trips_booking.init({
    seats: DataTypes.JSON,
    mPesa_code: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    isCanceled: DataTypes.BOOLEAN,
    mPesaNumber: DataTypes.STRING,
    status: DataTypes.ENUM('CANCELLED', 'ACCEPTED', 'PEDDING'),
  }, {
    sequelize,
    modelName: 'Trips_booking',
  });
  return Trips_booking;
};