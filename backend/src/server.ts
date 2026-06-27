import { createApp } from './app';
import { env } from './config/env';
import { sequelize } from './models';

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('[db] connection established');

    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] failed to start', err);
    process.exit(1);
  }
}

start();
