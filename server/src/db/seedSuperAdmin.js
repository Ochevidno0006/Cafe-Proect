/**
 * Creates the platform's first Super Admin from env vars.
 * Usage: npm run seed:superadmin
 * (SUPERADMIN_PHONE / SUPERADMIN_PASSWORD / SUPERADMIN_FIRST_NAME / SUPERADMIN_LAST_NAME in .env)
 */
const { pool } = require('../config/db');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');

async function main() {
  const phone = process.env.SUPERADMIN_PHONE;
  const password = process.env.SUPERADMIN_PASSWORD;
  const firstName = process.env.SUPERADMIN_FIRST_NAME || 'Super';
  const lastName = process.env.SUPERADMIN_LAST_NAME || 'Admin';

  if (!phone || !password) {
    throw new Error('Set SUPERADMIN_PHONE and SUPERADMIN_PASSWORD in .env before running this script');
  }
  if (password.length < 8) {
    throw new Error('SUPERADMIN_PASSWORD must be at least 8 characters');
  }

  const existing = await userRepository.findByPhone(phone, { includeDeleted: true });
  if (existing) {
    console.log(`A user with phone ${phone} already exists (role: ${existing.roleCode}). Nothing to do.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = await userRepository.create(client, {
      firstName,
      lastName,
      phone,
      passwordHash,
      roleCode: 'super_admin',
    });
    await client.query('COMMIT');
    console.log(`Super Admin created: ${user.first_name} ${user.last_name} (${user.phone})`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
