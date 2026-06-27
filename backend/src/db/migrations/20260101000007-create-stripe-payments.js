'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stripe_payments', {
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
      currency_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'currencies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      checkout_session_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      payment_intent_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      credits_to_grant: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      amount_paise: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('stripe_payments', ['user_id'], {
      name: 'idx_stripe_payments_user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stripe_payments');
  },
};
