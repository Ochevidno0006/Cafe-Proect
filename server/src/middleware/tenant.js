const cafeRepository = require('../repositories/cafeRepository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Resolves which cafe the current request is allowed to touch, and attaches
 * it as req.cafeId / req.cafe / req.isSuperAdmin.
 *
 * This is the single choke point for multi-tenant isolation:
 *
 *  - Admin:       cafeId is ALWAYS derived from the authenticated user
 *                 (their own cafe, looked up server-side). Any cafeId in the
 *                 URL, query string, or request body is ignored outright —
 *                 an Admin can never point this at someone else's cafe.
 *
 *  - Super Admin: cafeId comes from the :cafeId route param, since Super
 *                 Admin legitimately needs to operate on any cafe. The cafe
 *                 is still loaded and validated to exist (404 if not).
 *
 * Every downstream repository call for cafe-scoped tables must filter by
 * req.cafeId in the SQL itself (not just check it after fetching), so this
 * middleware is the first of two layers, not the only one.
 */
const resolveCafeAccess = asyncHandler(async (req, res, next) => {
  if (!req.user) throw AppError.unauthorized();

  if (req.user.roleCode === 'super_admin') {
    const { cafeId } = req.params;
    if (!cafeId) throw AppError.badRequest('cafeId обязателен для Super Admin');
    const cafe = await cafeRepository.findById(cafeId);
    if (!cafe) throw AppError.notFound('Кафе не найдено');
    req.cafeId = cafe.id;
    req.cafe = cafe;
    req.isSuperAdmin = true;
    return next();
  }

  if (req.user.roleCode === 'admin') {
    const cafe = await cafeRepository.findByOwnerId(req.user.id);
    if (!cafe) throw AppError.notFound('У вас ещё нет кафе');
    req.cafeId = cafe.id;
    req.cafe = cafe;
    req.isSuperAdmin = false;
    return next();
  }

  throw AppError.forbidden();
});

module.exports = { resolveCafeAccess };
