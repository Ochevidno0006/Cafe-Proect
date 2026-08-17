const repository = require('../repositories/galleryRepository');
const { makeSimpleCrudController } = require('./simpleCrudControllerFactory');

module.exports = makeSimpleCrudController({
  repository,
  resourceKey: 'gallery',
  singularKey: 'photo',
  entityType: 'gallery_photo',
  tableName: 'gallery',
  notFoundMessage: 'Фото не найдено',
});
