const repo = require('../repositories/cafeSettingsRepository');
const asyncHandler = require('../utils/asyncHandler');

const getSettings = asyncHandler(async (req, res) => {
  res.json({ settings: await repo.getCafeSettings(req.cafeId) });
});

const updateSettings = asyncHandler(async (req, res) => {
  res.json({ settings: await repo.updateCafeSettings(req.cafeId, req.body) });
});

const getTheme = asyncHandler(async (req, res) => {
  res.json({ theme: await repo.getTheme(req.cafeId) });
});

const updateTheme = asyncHandler(async (req, res) => {
  res.json({ theme: await repo.updateTheme(req.cafeId, req.body) });
});

const getWorkingHours = asyncHandler(async (req, res) => {
  res.json({ workingHours: await repo.getWorkingHours(req.cafeId) });
});

const updateWorkingHours = asyncHandler(async (req, res) => {
  res.json({ workingHours: await repo.setWorkingHours(req.cafeId, req.body.days) });
});

const getLanguages = asyncHandler(async (req, res) => {
  res.json({ languages: await repo.getLanguages(req.cafeId) });
});

const updateLanguages = asyncHandler(async (req, res) => {
  res.json({ languages: await repo.setLanguages(req.cafeId, req.body.languages) });
});

module.exports = {
  getSettings,
  updateSettings,
  getTheme,
  updateTheme,
  getWorkingHours,
  updateWorkingHours,
  getLanguages,
  updateLanguages,
};
