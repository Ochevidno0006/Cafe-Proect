const { query } = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// DB-backed (not in-memory) so the lockout survives process restarts and works
// correctly even if the API ever runs as more than one instance.
async function assertNotLockedOut(phone) {
  const { rows } = await query(
    `SELECT success FROM login_attempts
     WHERE phone = $1 AND created_at > now() - ($2 || ' minutes')::interval
     ORDER BY created_at DESC
     LIMIT $3`,
    [phone, env.loginLockoutMinutes, env.loginMaxAttempts]
  );
  const recentFailures = rows.filter((r) => r.success === false).length;
  if (rows.length >= env.loginMaxAttempts && recentFailures === rows.length) {
    throw AppError.tooManyRequests(
      `Слишком много неудачных попыток входа. Попробуйте снова через ${env.loginLockoutMinutes} мин.`
    );
  }
}

async function recordAttempt(phone, ip, success) {
  await query(`INSERT INTO login_attempts (phone, ip, success) VALUES ($1, $2, $3)`, [
    phone,
    ip,
    success,
  ]);
}

module.exports = { assertNotLockedOut, recordAttempt };
