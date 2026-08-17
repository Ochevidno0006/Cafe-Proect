const AppError = require('../utils/AppError');

function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Postgres unique-violation and FK-violation get a clean 4xx instead of a 500 dump.
  if (err && err.code === '23505') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'Запись уже существует' } });
  }
  if (err && err.code === '23503') {
    return res
      .status(400)
      .json({ error: { code: 'BAD_REQUEST', message: 'Связанная запись не найдена' } });
  }

  // Never leak stack traces or internals to the client.
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } });
}

module.exports = { notFoundHandler, errorHandler };
