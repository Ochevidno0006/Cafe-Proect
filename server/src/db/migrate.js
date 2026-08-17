/**
 * Minimal, dependency-free migration runner for plain .sql files.
 *
 * Usage:
 *   node src/db/migrate.js up        - apply all pending migrations
 *   node src/db/migrate.js status    - list applied / pending migrations
 *   node src/db/migrate.js down      - roll back the single most recent migration
 *                                      (only if a matching .down.sql file exists)
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function listMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort();
}

async function getAppliedIds() {
  const { rows } = await pool.query('SELECT id FROM schema_migrations ORDER BY id');
  return new Set(rows.map((r) => r.id));
}

async function up() {
  await ensureMigrationsTable();
  const files = listMigrationFiles();
  const applied = await getAppliedIds();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log('No pending migrations. Database is up to date.');
    return;
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed to apply ${file}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }
  console.log(`Done. Applied ${pending.length} migration(s).`);
}

async function down() {
  await ensureMigrationsTable();
  const { rows } = await pool.query(
    'SELECT id FROM schema_migrations ORDER BY id DESC LIMIT 1'
  );
  if (rows.length === 0) {
    console.log('Nothing to roll back.');
    return;
  }
  const last = rows[0].id;
  const downFile = last.replace(/\.sql$/, '.down.sql');
  const downPath = path.join(MIGRATIONS_DIR, downFile);
  if (!fs.existsSync(downPath)) {
    console.error(
      `No .down.sql found for ${last}. Write ${downFile} to enable rollback, or restore from a backup.`
    );
    process.exitCode = 1;
    return;
  }
  const sql = fs.readFileSync(downPath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('DELETE FROM schema_migrations WHERE id = $1', [last]);
    await client.query('COMMIT');
    console.log(`Rolled back: ${last}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed to roll back ${last}:`, err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function status() {
  await ensureMigrationsTable();
  const files = listMigrationFiles();
  const applied = await getAppliedIds();
  for (const file of files) {
    console.log(`${applied.has(file) ? '[applied]' : '[pending]'} ${file}`);
  }
}

async function main() {
  const cmd = process.argv[2] || 'up';
  try {
    if (cmd === 'up') await up();
    else if (cmd === 'down') await down();
    else if (cmd === 'status') await status();
    else {
      console.error(`Unknown command: ${cmd}. Use up | down | status.`);
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

module.exports = { up, down, status, ensureMigrationsTable };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
