'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Trip.belongsTo(models.Car,{
        foreignKey: 'car_id',
        onDelete: 'CASCADE'
      });

      Trip.belongsTo(models.User,{
        foreignKey: {
          name: 'user_id',
          field: 'user_id',
        },
        onDelete: 'CASCADE',
      });
      
      Trip.hasMany(models.Trips_booking,{foreignKey: 'trip_id'});
      Trip.hasOne(models.Location_point,{foreignKey: 'trip_id'});
    }
  };
  Trip.init({
    from: DataTypes.JSON,
    to: DataTypes.JSON,
    departure_time: DataTypes.STRING,
    amount_per_seat: DataTypes.INTEGER,
    seats: DataTypes.INTEGER,
    trip_note: DataTypes.STRING,
    stop_over: DataTypes.JSON,
    liftRules: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'Trip',
  });
  return Trip;
};