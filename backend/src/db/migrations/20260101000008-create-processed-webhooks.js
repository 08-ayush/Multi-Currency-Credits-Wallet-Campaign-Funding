'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('processed_webhooks', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // The UNIQUE constraint here is the cornerstone of webhook idempotency:
      // a duplicate event insert fails, signalling "already processed".
      stripe_event_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('processed_webhooks');
  },
};
