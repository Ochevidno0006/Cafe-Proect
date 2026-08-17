const menuBlockRepository = require('../repositories/menuBlockRepository');
const auditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { reorderScoped } = require('../repositories/shared/reorderable');

const list = asyncHandler(async (req, res) => {
  res.json({ menuBlocks: await menuBlockRepository.list(req.cafeId) });
});

const create = asyncHandler(async (req, res) => {
  const block = await menuBlockRepository.create(req.cafeId, req.body);
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'menu_block_created',
    entityType: 'menu_block',
    entityId: block.id,
  });
  res.status(201).json({ menuBlock: block });
});

const update = asyncHandler(async (req, res) => {
  const existing = await menuBlockRepository.findByIdScoped(req.params.id, req.cafeId);
  if (!existing) throw AppError.notFound('Блок меню не найден');
  const block = await menuBlockRepository.updateScoped(req.params.id, req.cafeId, req.body);
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'menu_block_updated',
    entityType: 'menu_block',
    entityId: block.id,
  });
  res.json({ menuBlock: block });
});

const duplicate = asyncHandler(async (req, res) => {
  const copy = await menuBlockRepository.duplicateScoped(req.params.id, req.cafeId);
  if (!copy) throw AppError.notFound('Блок меню не найден');
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'menu_block_duplicated',
    entityType: 'menu_block',
    entityId: copy.id,
  });
  res.status(201).json({ menuBlock: copy });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await menuBlockRepository.removeScoped(req.params.id, req.cafeId);
  if (!deleted) throw AppError.notFound('Блок меню не найден');
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'menu_block_deleted',
    entityType: 'menu_block',
    entityId: req.params.id,
  });
  res.status(204).send();
});

const setDishes = asyncHandler(async (req, res) => {
  const owned = await menuBlockRepository.assertOwnedByCafe(req.params.id, req.cafeId);
  if (!owned) throw AppError.notFound('Блок меню не найден');
  await menuBlockRepository.setDishes(req.params.id, req.cafeId, req.body.dishIds);
  res.json({ menuBlock: await menuBlockRepository.findByIdScoped(req.params.id, req.cafeId) });
});

const reorder = asyncHandler(async (req, res) => {
  await reorderScoped('menu_blocks', req.cafeId, req.body.orderedIds);
  res.json({ menuBlocks: await menuBlockRepository.list(req.cafeId) });
});

module.exports = { list, create, update, duplicate, remove, setDishes, reorder };
