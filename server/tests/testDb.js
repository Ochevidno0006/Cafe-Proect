/**
 * Ensures tests run against their own database (never the dev DB the
 * person uses locally). Derives a `_test`-suffixed database name from
 * DATABASE_URL, creates it if missing, applies migrations, and points
 * process.env.DATABASE_URL at it — all BEFORE any other module in this
 * process requires ../src/config/db, so every pool in the process (app,
 * migrate, etc.) ends up connected to the test database.
 */
require('dotenv').config();
const { Client } = require('pg');

function toTestUrl(originalUrl) {
  const url = new URL(originalUrl);
  const dbName = url.pathname.replace(/^\//, '');
  url.pathname = `/${dbName.replace(/_test$/, '')}_test`;
  return url.toString();
}

async function ensureTestDatabase() {
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) throw new Error('DATABASE_URL must be set (see .env.example) before running tests');

  const testUrl = toTestUrl(originalUrl);
  const testDbName = new URL(testUrl).pathname.replace(/^\//, '');

  const adminUrl = new URL(testUrl);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${testDbName}"`);
  } catch (err) {
    if (err.code !== '42P04') throw err; // 42P04 = database already exists — fine
  } finally {
    await admin.end();
  }

  process.env.DATABASE_URL = testUrl;

  // Only now import anything that touches config/db, so it picks up the
  // test URL we just set.
  const { up } = require('../src/db/migrate');
  await up();
}

module.exports = { ensureTestDatabase };
