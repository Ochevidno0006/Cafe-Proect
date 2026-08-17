const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('Файл не получен');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

module.exports = { uploadImage };
