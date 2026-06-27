// Sequelize CLI configuration (CommonJS).
// This file is consumed both by the Sequelize CLI (migrations/seeders) and,
// indirectly, by the application bootstrap which re-reads the same env vars.
require('dotenv').config();

const shared = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  // Keep DB-level snake_case timestamps consistent with our migrations.
  define: {
    underscored: true,
  },
  logging: false,
};

module.exports = {
  development: {
    ...shared,
    database: process.env.DB_NAME || 'credits_wallet',
  },
  test: {
    ...shared,
    database: process.env.DB_NAME_TEST || 'credits_wallet_test',
  },
  production: {
    ...shared,
    database: process.env.DB_NAME || 'credits_wallet',
  },
};
