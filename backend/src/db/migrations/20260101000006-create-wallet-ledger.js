'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallet_ledger', {
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
      entry_type: {
        type: Sequelize.ENUM('PURCHASE', 'SPEND'),
        allowNull: false,
      },
      // Signed delta: positive for PURCHASE, negative for SPEND.
      // The sum of credits_delta per (wallet, currency) equals the balance.
      credits_delta: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reference_type: {
        type: Sequelize.ENUM('PAYMENT', 'CAMPAIGN'),
        allowNull: false,
      },
      reference_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('wallet_ledger', ['wallet_id', 'currency_id'], {
      name: 'idx_wallet_ledger_wallet_currency',
    });
    await queryInterface.addIndex('wallet_ledger', ['reference_type', 'reference_id'], {
      name: 'idx_wallet_ledger_reference',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wallet_ledger');
  },
};
