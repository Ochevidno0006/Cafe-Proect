const AppError = require('../utils/AppError');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest(
        'Некорректные данные запроса',
        result.error.flatten().fieldErrors
      );
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
