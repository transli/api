'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User,{
        foreignKey: {
          field: 'sender',
          name: 'sender',
        }
      });
    }
  };
  Message.init({
    receiver: DataTypes.INTEGER,
    msg_body: DataTypes.TEXT,
    isRead: DataTypes.BOOLEAN,
    isFlaged: DataTypes.BOOLEAN,
    isReplied: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};