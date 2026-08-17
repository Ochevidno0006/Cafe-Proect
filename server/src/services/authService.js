const { withTransaction, query } = require('../config/db');
const userRepository = require('../repositories/userRepository');
const cafeRepository = require('../repositories/cafeRepository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAccessToken, generateRefreshToken, hashToken } = require('../utils/jwt');
const { slugifyUnique } = require('../utils/slug');
const AppError = require('../utils/AppError');
const auditService = require('./auditService');
const loginThrottleService = require('./loginThrottleService');
const env = require('../config/env');

const REFRESH_TTL_MS = parseDurationToMs(env.jwtRefreshTtl);

function parseDurationToMs(ttl) {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return n * unit;
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, hashToken(refreshToken), expiresAt]
  );
  return { accessToken, refreshToken };
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.roleCode,
    status: user.status,
    themePreference: user.themePreference,
  };
}

/**
 * Registers a new cafe Admin and creates their cafe workspace in one
 * transaction, so we never end up with an orphaned user or an orphaned cafe.
 */
async function registerAdmin({ firstName, lastName, phone, cafeName, password }) {
  const existing = await userRepository.findByPhone(phone, { includeDeleted: true });
  if (existing) {
    throw AppError.conflict('Этот номер телефона уже зарегистрирован');
  }

  const passwordHash = await hashPassword(password);
  const slug = slugifyUnique(cafeName);

  const { user, cafe } = await withTransaction(async (client) => {
    const newUser = await userRepository.create(client, {
      firstName,
      lastName,
      phone,
      passwordHash,
      roleCode: 'admin',
    });

    const newCafe = await cafeRepository.create(client, {
      ownerUserId: newUser.id,
      name: cafeName,
      slug,
    });

    await client.query(`INSERT INTO cafe_settings (cafe_id) VALUES ($1)`, [newCafe.id]);
    await client.query(`INSERT INTO theme_settings (cafe_id) VALUES ($1)`, [newCafe.id]);
    await client.query(
      `INSERT INTO cafe_languages (cafe_id, language_code, is_enabled) VALUES ($1, 'ru', true)`,
      [newCafe.id]
    );
    for (let day = 0; day <= 6; day += 1) {
      await client.query(
        `INSERT INTO working_hours (cafe_id, day_of_week, mode, open_time, close_time)
         VALUES ($1, $2, 'workday', '09:00', '22:00')`,
        [newCafe.id, day]
      );
    }
    await client.query(
      `INSERT INTO qr_links (cafe_id, slug) VALUES ($1, $2)`,
      [newCafe.id, slug]
    );

    await auditService.log(
      {
        actorUserId: newUser.id,
        cafeId: newCafe.id,
        action: 'admin_registered',
        entityType: 'cafe',
        entityId: newCafe.id,
      },
      client
    );

    return { user: newUser, cafe: newCafe };
  });

  const fullUser = await userRepository.findById(user.id);
  const tokens = await issueTokenPair(fullUser);
  return { user: publicUser(fullUser), cafe, ...tokens };
}

async function login({ phone, password, ip }) {
  await loginThrottleService.assertNotLockedOut(phone);

  const user = await userRepository.findByPhone(phone);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  await loginThrottleService.recordAttempt(phone, ip, Boolean(valid));

  if (!user || !valid) {
    throw AppError.unauthorized('Неверный номер телефона или пароль');
  }
  if (user.status === 'blocked') {
    throw AppError.forbidden('Аккаунт заблокирован. Обратитесь к администратору платформы.');
  }

  const tokens = await issueTokenPair(user);
  await auditService.log({ actorUserId: user.id, action: 'login' });

  let cafe = null;
  if (user.roleCode === 'admin') {
    cafe = await cafeRepository.findByOwnerId(user.id);
  }

  return { user: publicUser(user), cafe, ...tokens };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) throw AppError.unauthorized('Отсутствует refresh-токен');
  const tokenHash = hashToken(refreshToken);

  const { rows } = await query(
    `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at
     FROM refresh_tokens rt WHERE rt.token_hash = $1`,
    [tokenHash]
  );
  const record = rows[0];
  if (!record || record.revoked_at || new Date(record.expires_at) < new Date()) {
    throw AppError.unauthorized('Сессия истекла, войдите снова');
  }

  // Rotate: revoke the used refresh token and issue a brand new pair.
  await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [record.id]);

  const user = await userRepository.findById(record.user_id);
  if (!user || user.status === 'blocked') {
    throw AppError.unauthorized('Аккаунт недоступен');
  }

  const tokens = await issueTokenPair(user);
  return { user: publicUser(user), ...tokens };
}

async function logout({ refreshToken }) {
  if (!refreshToken) return;
  await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, [
    hashToken(refreshToken),
  ]);
}

module.exports = { registerAdmin, login, refresh, logout, publicUser };
