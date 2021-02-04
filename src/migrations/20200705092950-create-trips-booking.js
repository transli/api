'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trips_bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trip_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Trips', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        }
      },
      lift_owner_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
      },
      seats: {
        type: Sequelize.JSON
      },
      mPesa_code: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM('CANCELLED', 'ACCEPTED', 'PEDDING'),
      },
      isCanceled: {
        type: Sequelize.BOOLEAN
      },
      mPesaNumber: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Trips_bookings');
  }
};