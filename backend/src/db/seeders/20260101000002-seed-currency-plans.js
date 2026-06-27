'use strict';

// Bundled plans per currency. price_paise is derived from the currency's
// price_per_credit_paise so seed data is always internally consistent.
const PLAN_CREDITS_BY_CODE = {
  CAMPAIGN_CREDITS: [10, 50, 100],
  REPORT_CREDITS: [5, 20, 50],
  DISCOVERY_CREDITS: [10, 25, 100],
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const [currencies] = await queryInterface.sequelize.query(
      'SELECT id, code, price_per_credit_paise FROM currencies;'
    );

    const rows = [];
    for (const currency of currencies) {
      const creditOptions = PLAN_CREDITS_BY_CODE[currency.code] || [];
      for (const credits of creditOptions) {
        rows.push({
          currency_id: currency.id,
          credits,
          price_paise: credits * currency.price_per_credit_paise,
        });
      }
    }

    if (rows.length > 0) {
      await queryInterface.bulkInsert('currency_plans', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('currency_plans', null, {});
  },
};
