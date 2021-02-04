'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reviews = sequelize.define('Reviews', {
    vehiclebookingId: DataTypes.INTEGER,
    review: DataTypes.STRING,
    rate: DataTypes.INTEGER,
  }, {});
  Reviews.associate = function(models) {
    // associations can be defined here
    Reviews.belongsTo(models.Vehicle, {
      foreignKey: {
        name: 'VehicleId',
        field: 'VehicleId',
        allowNull: false,
      },
    });

    Reviews.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'userId',
        allowNull: false,
      },
    })
  };
  return Reviews;
};