'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('currencies', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      // The module a currency is bound to (CAMPAIGN / REPORT / DISCOVERY).
      // Stored in the DB so the currency<->module binding is configurable.
      module_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      price_per_credit_paise: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('currencies');
  },
};
