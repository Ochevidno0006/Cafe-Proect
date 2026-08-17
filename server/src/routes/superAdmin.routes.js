const { Router } = require('express');
const superAdminController = require('../controllers/superAdminController');
const auditLogController = require('../controllers/auditLogController');

const router = Router();

router.get('/admins', superAdminController.listAdmins);
router.get('/cafes', superAdminController.listCafes);
router.post('/admins/:userId/block', superAdminController.blockAdmin);
router.post('/admins/:userId/unblock', superAdminController.unblockAdmin);
router.delete('/admins/:userId', superAdminController.deleteAdmin);
router.post('/admins/:userId/restore', superAdminController.restoreAdmin);
router.post('/admins/:userId/impersonate', superAdminController.impersonateAdmin);
router.get('/audit-log', auditLogController.listPlatform);

module.exports = router;
