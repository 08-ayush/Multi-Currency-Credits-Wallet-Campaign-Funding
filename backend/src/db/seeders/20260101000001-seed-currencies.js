'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('currencies', [
      {
        name: 'Campaign Credits',
        code: 'CAMPAIGN_CREDITS',
        module_name: 'CAMPAIGN',
        price_per_credit_paise: 300,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Report Credits',
        code: 'REPORT_CREDITS',
        module_name: 'REPORT',
        price_per_credit_paise: 1000,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Discovery Credits',
        code: 'DISCOVERY_CREDITS',
        module_name: 'DISCOVERY',
        price_per_credit_paise: 500,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('currencies', {
      code: {
        [Sequelize.Op.in]: [
          'CAMPAIGN_CREDITS',
          'REPORT_CREDITS',
          'DISCOVERY_CREDITS',
        ],
      },
    });
  },
};
