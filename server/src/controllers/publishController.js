const publishService = require('../services/publishService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');

const preview = asyncHandler(async (req, res) => {
  res.json({ preview: await publishService.buildSnapshot(req.cafeId) });
});

const publish = asyncHandler(async (req, res) => {
  const result = await publishService.publish(req.cafeId, req.user.id);
  await auditService.log({
    actorUserId: req.user.id,
    cafeId: req.cafeId,
    action: 'menu_published',
    entityType: 'cafe',
    entityId: req.cafeId,
  });
  res.status(201).json({ publishedAt: result.publishedAt });
});

const lastPublication = asyncHandler(async (req, res) => {
  const publication = await publishService.getLatestPublication(req.cafeId);
  res.json({ publication });
});

module.exports = { preview, publish, lastPublication };
