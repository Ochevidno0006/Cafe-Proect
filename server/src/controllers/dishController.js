const dishRepository = require('../repositories/dishRepository');
const auditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { reorderScoped } = require('../repositories/shared/reorderable');

const ALLOWED_LANGUAGES = ['ru', 'tg', 'en'];

const list = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;
  const dishes = await dishRepository.list(req.cafeId, { categoryId });
  res.json({ dishes });
});

const get = asyncHandler(async (req, res) => {
  const dish = await dishRepository.findByIdScoped(req.params.id, req.cafeId);
  if (!dish) throw AppError.notFound('Блюдо не найдено');
  res.json({ dish });
});

const create = asyncHandler(async (req, res) => {
  if (req.body.categoryId) {
    const categoryRepository = require('../repositories/categoryRepository');
    const category = await categoryRepository.findByIdScoped(req.body.categoryId, req.cafeId);
    if (!category) throw AppError.badRequest('Категория не найдена в этом кафе');
  }
  const dish = await dishRepository.create(req.cafeId, req.body);
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'dish_created',
    entityType: 'dish',
    entityId: dish.id,
  });
  res.status(201).json({ dish });
});

const update = asyncHandler(async (req, res) => {
  const existing = await dishRepository.findByIdScoped(req.params.id, req.cafeId);
  if (!existing) throw AppError.notFound('Блюдо не найдено');

  if (req.body.categoryId) {
    const categoryRepository = require('../repositories/categoryRepository');
    const category = await categoryRepository.findByIdScoped(req.body.categoryId, req.cafeId);
    if (!category) throw AppError.badRequest('Категория не найдена в этом кафе');
  }

  const dish = await dishRepository.updateScoped(req.params.id, req.cafeId, req.body);
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'dish_updated',
    entityType: 'dish',
    entityId: dish.id,
  });
  res.json({ dish });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await dishRepository.removeScoped(req.params.id, req.cafeId);
  if (!deleted) throw AppError.notFound('Блюдо не найдено');
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'dish_deleted',
    entityType: 'dish',
    entityId: req.params.id,
  });
  res.status(204).send();
});

const setAttributes = asyncHandler(async (req, res) => {
  const owned = await dishRepository.assertOwnedByCafe(req.params.id, req.cafeId);
  if (!owned) throw AppError.notFound('Блюдо не найдено');
  await dishRepository.setAttributes(req.params.id, req.body.attributes);
  const dish = await dishRepository.findByIdScoped(req.params.id, req.cafeId);
  res.json({ dish });
});

const setTranslation = asyncHandler(async (req, res) => {
  const { id, lang } = req.params;
  if (!ALLOWED_LANGUAGES.includes(lang)) throw AppError.badRequest('Неизвестный код языка');
  const owned = await dishRepository.assertOwnedByCafe(id, req.cafeId);
  if (!owned) throw AppError.notFound('Блюдо не найдено');
  await dishRepository.setTranslation(id, lang, req.body);
  const dish = await dishRepository.findByIdScoped(id, req.cafeId);
  res.json({ dish });
});

const setLabels = asyncHandler(async (req, res) => {
  const owned = await dishRepository.assertOwnedByCafe(req.params.id, req.cafeId);
  if (!owned) throw AppError.notFound('Блюдо не найдено');
  await dishRepository.setLabels(req.params.id, req.body.labels);
  const dish = await dishRepository.findByIdScoped(req.params.id, req.cafeId);
  res.json({ dish });
});

const reorder = asyncHandler(async (req, res) => {
  await reorderScoped('dishes', req.cafeId, req.body.orderedIds);
  res.json({ dishes: await dishRepository.list(req.cafeId) });
});

module.exports = { list, get, create, update, remove, setAttributes, setTranslation, setLabels, reorder };
