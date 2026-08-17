const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, cafeName, password } = req.body;
  const result = await authService.registerAdmin({ firstName, lastName, phone, cafeName, password });
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const ip = req.ip;
  const result = await authService.login({ phone, password, ip });
  res.json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh({ refreshToken });
  res.json(result);
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout({ refreshToken });
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: authService.publicUser(req.user) });
});

module.exports = { register, login, refresh, logout, me };
