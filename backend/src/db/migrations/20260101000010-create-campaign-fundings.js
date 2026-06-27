'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_fundings', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // UNIQUE: a campaign can be funded at most once. This is the DB-level
      // guarantee backing the "campaign funded only once" acceptance criterion.
      campaign_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'campaigns', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ledger_entry_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'wallet_ledger', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaign_fundings');
  },
};
