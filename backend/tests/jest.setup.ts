import { sequelize } from '../src/models';

// Close the shared connection pool after the whole suite finishes so Jest exits.
afterAll(async () => {
  await sequelize.close();
});
