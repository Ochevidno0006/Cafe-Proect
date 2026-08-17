const userRepository = require('../repositories/userRepository');
const cafeRepository = require('../repositories/cafeRepository');
const authService = require('../services/authService');
const auditService = require('../services/auditService');
const { signAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listAdmins = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === 'true';
  const admins = await userRepository.listAdmins({ includeDeleted });
  res.json({ admins: admins.map(authService.publicUser) });
});

const listCafes = asyncHandler(async (req, res) => {
  const cafes = await cafeRepository.listAll();
  res.json({ cafes });
});

async function getTargetAdmin(userId) {
  const admin = await userRepository.findById(userId, { includeDeleted: true });
  if (!admin || admin.roleCode !== 'admin') throw AppError.notFound('Администратор не найден');
  return admin;
}

const blockAdmin = asyncHandler(async (req, res) => {
  const admin = await getTargetAdmin(req.params.userId);
  await userRepository.setStatus(admin.id, 'blocked');
  await auditService.log({
    actorUserId: req.user.id,
    action: 'admin_blocked',
    entityType: 'user',
    entityId: admin.id,
  });
  res.status(204).send();
});

const unblockAdmin = asyncHandler(async (req, res) => {
  const admin = await getTargetAdmin(req.params.userId);
  await userRepository.setStatus(admin.id, 'active');
  await auditService.log({
    actorUserId: req.user.id,
    action: 'admin_unblocked',
    entityType: 'user',
    entityId: admin.id,
  });
  res.status(204).send();
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await getTargetAdmin(req.params.userId);
  const deleted = await userRepository.softDelete(admin.id);
  if (!deleted) throw AppError.conflict('Администратор уже удалён');
  await auditService.log({
    actorUserId: req.user.id,
    action: 'admin_deleted',
    entityType: 'user',
    entityId: admin.id,
  });
  res.status(204).send();
});

const restoreAdmin = asyncHandler(async (req, res) => {
  const admin = await getTargetAdmin(req.params.userId);
  const restored = await userRepository.restore(admin.id);
  if (!restored) throw AppError.conflict('Администратор не был удалён');
  await auditService.log({
    actorUserId: req.user.id,
    action: 'admin_restored',
    entityType: 'user',
    entityId: admin.id,
  });
  res.status(204).send();
});

// "Может войти как администратор для помощи/проверки" — issues a short-lived
// access token for the target admin, WITHOUT a refresh token (so the
// impersonation session naturally expires and can't be silently renewed),
// and always leaves an audit trail of who did it.
const impersonateAdmin = asyncHandler(async (req, res) => {
  const admin = await getTargetAdmin(req.params.userId);
  if (admin.status === 'blocked') throw AppError.forbidden('Администратор заблокирован');

  const accessToken = signAccessToken(admin);
  await auditService.log({
    actorUserId: req.user.id,
    action: 'admin_impersonated',
    entityType: 'user',
    entityId: admin.id,
  });
  res.json({ accessToken, user: authService.publicUser(admin) });
});

module.exports = {
  listAdmins,
  listCafes,
  blockAdmin,
  unblockAdmin,
  deleteAdmin,
  restoreAdmin,
  impersonateAdmin,
};
