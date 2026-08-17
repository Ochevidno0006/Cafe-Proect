const { Router } = require('express');
const { validateBody } = require('../middleware/validate');

const categoryController = require('../controllers/categoryController');
const dishController = require('../controllers/dishController');
const menuBlockController = require('../controllers/menuBlockController');
const advertisementController = require('../controllers/advertisementController');
const galleryController = require('../controllers/galleryController');
const contactController = require('../controllers/contactController');
const cafeSettingsController = require('../controllers/cafeSettingsController');
const publishController = require('../controllers/publishController');
const statisticsController = require('../controllers/statisticsController');
const uploadController = require('../controllers/uploadController');
const auditLogController = require('../controllers/auditLogController');
const { upload } = require('../middleware/upload');

const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidators');
const {
  createDishSchema,
  updateDishSchema,
  attributesSchema,
  translationSchema,
  labelsSchema,
  reorderSchema: dishReorderSchema,
} = require('../validators/dishValidators');
const {
  createMenuBlockSchema,
  updateMenuBlockSchema,
  setBlockDishesSchema,
  reorderSchema: blockReorderSchema,
} = require('../validators/menuBlockValidators');
const {
  reorderSchema,
  createAdvertisementSchema,
  updateAdvertisementSchema,
  createGallerySchema,
  updateGallerySchema,
  createContactSchema,
  updateContactSchema,
} = require('../validators/miscValidators');
const {
  updateCafeSettingsSchema,
  updateThemeSchema,
  workingHoursSchema,
  languagesSchema,
} = require('../validators/cafeSettingsValidators');

// Mounted twice in app.js:
//   /api/admin/*                    (authenticate + requireRole('admin') + resolveCafeAccess)
//   /api/superadmin/cafes/:cafeId/* (authenticate + requireRole('super_admin') + resolveCafeAccess)
// Both mounts guarantee req.cafeId is already resolved and trustworthy by the
// time these handlers run, so the same router/controllers serve both roles.
const router = Router();

// --- Категории ---
router.get('/categories', categoryController.list);
router.post('/categories', validateBody(createCategorySchema), categoryController.create);
router.patch('/categories/:id', validateBody(updateCategorySchema), categoryController.update);
router.delete('/categories/:id', categoryController.remove);
router.post('/categories/reorder', validateBody(reorderSchema), categoryController.reorder);

// --- Блюда ---
router.get('/dishes', dishController.list);
router.get('/dishes/:id', dishController.get);
router.post('/dishes', validateBody(createDishSchema), dishController.create);
router.patch('/dishes/:id', validateBody(updateDishSchema), dishController.update);
router.delete('/dishes/:id', dishController.remove);
router.put('/dishes/:id/attributes', validateBody(attributesSchema), dishController.setAttributes);
router.put('/dishes/:id/translations/:lang', validateBody(translationSchema), dishController.setTranslation);
router.put('/dishes/:id/labels', validateBody(labelsSchema), dishController.setLabels);
router.post('/dishes/reorder', validateBody(dishReorderSchema), dishController.reorder);

// --- Блоки меню ---
router.get('/menu-blocks', menuBlockController.list);
router.post('/menu-blocks', validateBody(createMenuBlockSchema), menuBlockController.create);
router.patch('/menu-blocks/:id', validateBody(updateMenuBlockSchema), menuBlockController.update);
router.post('/menu-blocks/:id/duplicate', menuBlockController.duplicate);
router.delete('/menu-blocks/:id', menuBlockController.remove);
router.put('/menu-blocks/:id/dishes', validateBody(setBlockDishesSchema), menuBlockController.setDishes);
router.post('/menu-blocks/reorder', validateBody(blockReorderSchema), menuBlockController.reorder);

// --- Реклама ---
router.get('/advertisements', advertisementController.list);
router.post('/advertisements', validateBody(createAdvertisementSchema), advertisementController.create);
router.patch('/advertisements/:id', validateBody(updateAdvertisementSchema), advertisementController.update);
router.delete('/advertisements/:id', advertisementController.remove);
router.post('/advertisements/reorder', validateBody(reorderSchema), advertisementController.reorder);

// --- Галерея ---
router.get('/gallery', galleryController.list);
router.post('/gallery', validateBody(createGallerySchema), galleryController.create);
router.patch('/gallery/:id', validateBody(updateGallerySchema), galleryController.update);
router.delete('/gallery/:id', galleryController.remove);
router.post('/gallery/reorder', validateBody(reorderSchema), galleryController.reorder);

// --- Контакты ---
router.get('/contacts', contactController.list);
router.post('/contacts', validateBody(createContactSchema), contactController.create);
router.patch('/contacts/:id', validateBody(updateContactSchema), contactController.update);
router.delete('/contacts/:id', contactController.remove);
router.post('/contacts/reorder', validateBody(reorderSchema), contactController.reorder);

// --- Настройки, дизайн, часы работы, языки ---
router.get('/settings', cafeSettingsController.getSettings);
router.patch('/settings', validateBody(updateCafeSettingsSchema), cafeSettingsController.updateSettings);
router.get('/theme', cafeSettingsController.getTheme);
router.patch('/theme', validateBody(updateThemeSchema), cafeSettingsController.updateTheme);
router.get('/working-hours', cafeSettingsController.getWorkingHours);
router.put('/working-hours', validateBody(workingHoursSchema), cafeSettingsController.updateWorkingHours);
router.get('/languages', cafeSettingsController.getLanguages);
router.put('/languages', validateBody(languagesSchema), cafeSettingsController.updateLanguages);

// --- Предпросмотр, публикация, статистика, загрузка изображений ---
router.get('/preview', publishController.preview);
router.post('/publish', publishController.publish);
router.get('/publication', publishController.lastPublication);
router.get('/statistics/overview', statisticsController.overview);
router.post('/uploads', upload.single('file'), uploadController.uploadImage);
router.get('/audit-log', auditLogController.list);

module.exports = router;
