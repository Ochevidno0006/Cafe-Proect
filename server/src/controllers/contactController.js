const repository = require('../repositories/contactRepository');
const { makeSimpleCrudController } = require('./simpleCrudControllerFactory');

module.exports = makeSimpleCrudController({
  repository,
  resourceKey: 'contacts',
  singularKey: 'contact',
  entityType: 'contact',
  tableName: 'contacts',
  notFoundMessage: 'Контакт не найден',
});
