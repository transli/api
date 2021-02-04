'use strict';

const { uniq } = require("lodash");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages_threads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      msg_thread_id: {
        type: Sequelize.UUID,
        unique: true,
      },
      lift_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Trips', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      sender: {
        type: Sequelize.INTEGER
      },
      receiver: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Messages_threads');
  }
};