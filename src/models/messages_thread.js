'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Messages_thread extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Messages_thread.hasMany(models.Message, {
        sourceKey: 'msg_thread_id',
        foreignKey: 'msg_thread_id'
      });

      Messages_thread.belongsTo(models.Trip,{
        foreignKey: {
          field: 'lift_id',
          name: 'lift_id',
        },
        onDelete: 'CASCADE',
      });
      
      Messages_thread.belongsTo(models.User,{
        foreignKey: {
          field: 'receiver',
          name: 'receiver',
        }
      });
    }
  };
  Messages_thread.init({
    sender: DataTypes.INTEGER,
    msg_thread_id: {
     type: DataTypes.UUID,
     defaultValue: DataTypes.UUIDV4,
     unique: true,
    },
  }, {
    sequelize,
    modelName: 'Messages_thread',
  });
  return Messages_thread;
};