const { verifyAccessToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the JWT access token and attaches the authenticated user to
 * req.user. This is the only place identity comes from — everything
 * downstream trusts req.user, never a body/query field.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized('Отсутствует токен авторизации');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw AppError.unauthorized('Недействительный или истёкший токен');
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) throw AppError.unauthorized('Пользователь не найден');
  if (user.status === 'blocked') throw AppError.forbidden('Аккаунт заблокирован');

  req.user = user;
  next();
});

/**
 * Restricts a route to one or more role codes (e.g. 'super_admin').
 * Must run after authenticate.
 */
function requireRole(...roleCodes) {
  return (req, res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roleCodes.includes(req.user.roleCode)) {
      return next(AppError.forbidden('Недостаточно прав для этого действия'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
