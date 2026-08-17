const auditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { reorderScoped } = require('../repositories/shared/reorderable');

/**
 * Builds a standard { list, create, update, remove, reorder } controller for
 * a cafe-scoped resource whose repository follows the list/findByIdScoped/
 * create/updateScoped/removeScoped convention (see advertisementRepository,
 * galleryRepository, contactRepository). Keeps categories/dishes/menuBlocks
 * as hand-written since they have extra relations, but avoids repeating this
 * boilerplate three more times for simpler tables.
 */
function makeSimpleCrudController({ repository, resourceKey, singularKey, entityType, tableName, notFoundMessage }) {
  const list = asyncHandler(async (req, res) => {
    res.json({ [resourceKey]: await repository.list(req.cafeId) });
  });

  const create = asyncHandler(async (req, res) => {
    const item = await repository.create(req.cafeId, req.body);
    await auditService.log({
      actorUserId: req.user.id,
      cafeId: req.cafeId,
      action: `${entityType}_created`,
      entityType,
      entityId: item.id,
    });
    res.status(201).json({ [singularKey]: item });
  });

  const update = asyncHandler(async (req, res) => {
    const existing = await repository.findByIdScoped(req.params.id, req.cafeId);
    if (!existing) throw AppError.notFound(notFoundMessage);
    const item = await repository.updateScoped(req.params.id, req.cafeId, req.body);
    await auditService.log({
      actorUserId: req.user.id,
      cafeId: req.cafeId,
      action: `${entityType}_updated`,
      entityType,
      entityId: item.id,
    });
    res.json({ [singularKey]: item });
  });

  const remove = asyncHandler(async (req, res) => {
    const deleted = await repository.removeScoped(req.params.id, req.cafeId);
    if (!deleted) throw AppError.notFound(notFoundMessage);
    await auditService.log({
      actorUserId: req.user.id,
      cafeId: req.cafeId,
      action: `${entityType}_deleted`,
      entityType,
      entityId: req.params.id,
    });
    res.status(204).send();
  });

  const reorder = asyncHandler(async (req, res) => {
    await reorderScoped(tableName, req.cafeId, req.body.orderedIds);
    res.json({ [resourceKey]: await repository.list(req.cafeId) });
  });

  return { list, create, update, remove, reorder };
}

module.exports = { makeSimpleCrudController };
