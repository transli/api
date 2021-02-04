'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verified_document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Verified_document.belongsTo(models.User, {
        foreignKey: {
          name: 'user_id',
          field: 'user_id',
        }, 
        hooks: true,
        onDelete: 'CASCADE',
      });
    }
  };
  Verified_document.init({
    id_number: DataTypes.STRING,
    insurance_stiker_url: DataTypes.STRING,
    driving_licence_number: DataTypes.STRING,
    user_photo_url: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN,
    iDtype: DataTypes.ENUM('PASSPORT', 'IDCARD')
  }, {
    sequelize,
    modelName: 'Verified_document',
  });
  return Verified_document;
};