'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    //userId: DataTypes.INTEGER,
    vehicleId: DataTypes.INTEGER,
  }, {});
  Bookmark.associate = function(models) {
    // associations can be defined here
    Bookmark.belongsTo(models.User,{
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'userId',
        field: 'userId',
        allowNull: false,
        constraints: false,
      },
    });
  };
  return Bookmark;
};