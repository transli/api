'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      msg_thread_id: {
        type: Sequelize.UUID,
        // unique: true,
      },
      sender: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      receiver: {
        type: Sequelize.INTEGER,
      },
      msg_body: {
        type: Sequelize.TEXT
      },
      isRead: {
        type: Sequelize.BOOLEAN
      },
      isFlaged: {
        type: Sequelize.BOOLEAN
      },
      isReplied: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Messages');
  }
};