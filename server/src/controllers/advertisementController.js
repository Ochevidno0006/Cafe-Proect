const repository = require('../repositories/advertisementRepository');
const { makeSimpleCrudController } = require('./simpleCrudControllerFactory');

module.exports = makeSimpleCrudController({
  repository,
  resourceKey: 'advertisements',
  singularKey: 'advertisement',
  entityType: 'advertisement',
  tableName: 'advertisements',
  notFoundMessage: 'Реклама не найдена',
});
