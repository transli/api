'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class App_version extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  App_version.init({
    versionCode: DataTypes.STRING,
    versionName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'App_version',
  });
  return App_version;
};