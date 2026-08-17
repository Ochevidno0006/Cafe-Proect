const publishService = require('../services/publishService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getMenuBySlug = asyncHandler(async (req, res) => {
  const result = await publishService.getPublishedBySlug(req.params.slug);
  if (!result) throw AppError.notFound('Меню не найдено или ещё не опубликовано');
  await publishService.recordStatEvent(result.cafeId, 'menu_view');
  res.json({ menu: result.snapshot, publishedAt: result.publishedAt });
});

const ALLOWED_EVENTS = ['dish_view', 'category_view', 'qr_scan', 'link_open'];

const recordEvent = asyncHandler(async (req, res) => {
  const { eventType, entityId } = req.body;
  if (!ALLOWED_EVENTS.includes(eventType)) throw AppError.badRequest('Неизвестный тип события');
  const result = await publishService.getPublishedBySlug(req.params.slug);
  if (!result) throw AppError.notFound('Меню не найдено');
  await publishService.recordStatEvent(result.cafeId, eventType, entityId || null);
  res.status(204).send();
});

module.exports = { getMenuBySlug, recordEvent };
