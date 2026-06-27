'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('currency_plans', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      currency_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'currencies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      credits: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      price_paise: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('currency_plans', ['currency_id'], {
      name: 'idx_currency_plans_currency_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('currency_plans');
  },
};
