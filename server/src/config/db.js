const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  // Unexpected error on an idle client — never crash the whole process on this.
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Run a query with a plain client from the pool.
 */
function query(text, params) {
  return pool.query(text, params);
}

/**
 * Run a callback inside a single transaction. Commits on success,
 * rolls back on any thrown error, and always releases the client.
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
