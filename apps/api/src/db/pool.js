import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export default pool;
