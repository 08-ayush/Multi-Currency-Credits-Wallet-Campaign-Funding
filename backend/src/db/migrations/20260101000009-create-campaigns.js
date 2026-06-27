'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'FUNDED'),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      required_credits: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      funded_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('campaigns', ['user_id'], {
      name: 'idx_campaigns_user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaigns');
  },
};
