const { Router } = require('express');
const publicMenuController = require('../controllers/publicMenuController');
const { validateBody } = require('../middleware/validate');
const { z } = require('zod');

const router = Router();

const eventSchema = z.object({
  eventType: z.enum(['dish_view', 'category_view', 'qr_scan', 'link_open']),
  entityId: z.string().uuid().nullish(),
});

router.get('/menu/:slug', publicMenuController.getMenuBySlug);
router.post('/menu/:slug/events', validateBody(eventSchema), publicMenuController.recordEvent);

module.exports = router;
