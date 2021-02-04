'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Verified_documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_number: {
        type: Sequelize.STRING
      },
      insurance_stiker_url: {
        type: Sequelize.STRING
      },
      driving_licence_number: {
        type: Sequelize.STRING
      },
      user_photo_url: {
        type: Sequelize.STRING
      },
      isVerified: {
        type: Sequelize.BOOLEAN
      },
      iDtype: {
        type: Sequelize.ENUM('PASSPORT', 'IDCARD')
      },
      user_id: {
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
    await queryInterface.dropTable('Verified_documents');
  }
};