'use strict';
const uuidv4 = require('uuid/v4');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email address',
        },
      },
    },
    uuid:{
      unique: true,
      type: DataTypes.STRING,
    },
    pass: {
      type: DataTypes.STRING,
    },
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    lat: {
      type: DataTypes.DOUBLE(11, 8),
    },
    long: {
      type: DataTypes.DOUBLE(11, 8),
    },
    deviceId: {
      type: DataTypes.STRING,
    },
    active: DataTypes.BOOLEAN,
    avatorUrl: DataTypes.STRING
  }, {
    hooks: {
      afterValidate: async (user) => { 
        user.pass = user.pass || '12454389';
        user.uuid = uuidv4();
      },
    },
  });
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Vehicle, {
      foreignKey: {
        name: 'userId',
        field: 'userId',
        allowNull: false,
        constraints: false,
      },
      onDelete: 'CASCADE'
    });
    User.hasMany(models.Booking, {
      foreignKey: {
        name: 'userId',
        field: 'userId',
        allowNull: false,
        constraints: false,
      },
      onDelete: 'CASCADE'
    });
    User.hasMany(models.Bookmark,{
      foreignKey: {
        name: 'userId',
        field: 'userId',
      },
      onDelete: 'CASCADE'
    });
    User.hasMany(models.Trip,{
      foreignKey: {
        name: 'user_id',
        field: 'user_id',
      },
      onDelete: 'CASCADE',
    });
    User.hasMany(models.User_Rating,{
      foreignKey: {
        name: 'to_user_id',
        field: 'to_user_id',
      },
      hooks: true,
      onDelete: 'CASCADE',
    });
    User.hasOne(models.Verified_document,{
     foreignKey: {
       name: 'user_id',
       field: 'user_id',
     }, 
     hooks: true,
     onDelete: 'CASCADE',
    });
  };
  return User;
};