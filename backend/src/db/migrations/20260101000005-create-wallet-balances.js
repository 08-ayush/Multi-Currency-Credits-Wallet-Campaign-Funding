'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallet_balances', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      wallet_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'wallets', key: 'id' },
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
      balance_credits: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint('wallet_balances', {
      fields: ['wallet_id', 'currency_id'],
      type: 'unique',
      name: 'uq_wallet_balances_wallet_currency',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wallet_balances');
  },
};
