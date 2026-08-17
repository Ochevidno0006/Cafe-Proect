const categoryRepository = require('../repositories/categoryRepository');
const auditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { reorderScoped } = require('../repositories/shared/reorderable');

// Every handler below reads req.cafeId, which resolveCafeAccess middleware
// already derived server-side. req.body.cafeId (if a client sends one) is
// never read here — that's what makes cross-tenant writes impossible.

const list = asyncHandler(async (req, res) => {
  const categories = await categoryRepository.list(req.cafeId);
  res.json({ categories });
});

const create = asyncHandler(async (req, res) => {
  const { name, imageUrl, position } = req.body;
  const category = await categoryRepository.create(req.cafeId, { name, imageUrl, position });
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'category_created',
    entityType: 'category',
    entityId: category.id,
  });
  res.status(201).json({ category });
});

const update = asyncHandler(async (req, res) => {
  const existing = await categoryRepository.findByIdScoped(req.params.id, req.cafeId);
  if (!existing) throw AppError.notFound('Категория не найдена');

  const category = await categoryRepository.updateScoped(req.params.id, req.cafeId, req.body);
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'category_updated',
    entityType: 'category',
    entityId: category.id,
  });
  res.json({ category });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await categoryRepository.removeScoped(req.params.id, req.cafeId);
  if (!deleted) throw AppError.notFound('Категория не найдена');
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'category_deleted',
    entityType: 'category',
    entityId: req.params.id,
  });
  res.status(204).send();
});

const reorder = asyncHandler(async (req, res) => {
  await reorderScoped('categories', req.cafeId, req.body.orderedIds);
  res.json({ categories: await categoryRepository.list(req.cafeId) });
});

module.exports = { list, create, update, remove, reorder };
