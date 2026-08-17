class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Требуется авторизация') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Доступ запрещён') {
    return new AppError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Не найдено') {
    return new AppError(404, 'NOT_FOUND', message);
  }
  static conflict(message) {
    return new AppError(409, 'CONFLICT', message);
  }
  static tooManyRequests(message = 'Слишком много попыток, попробуйте позже') {
    return new AppError(429, 'TOO_MANY_REQUESTS', message);
  }
}

module.exports = AppError;
