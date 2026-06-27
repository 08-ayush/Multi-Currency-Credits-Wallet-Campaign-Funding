import { Sequelize } from 'sequelize';
import { env } from './env';

// Single shared Sequelize instance for the whole app.
// NOTE: schema is created/managed exclusively via Sequelize CLI migrations.
// sequelize.sync() is intentionally never called anywhere in this codebase.
export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
