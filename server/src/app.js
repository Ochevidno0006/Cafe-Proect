const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { authenticate, requireRole } = require('./middleware/auth');
const { resolveCafeAccess } = require('./middleware/tenant');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const cafeScopedRoutes = require('./routes/cafeScoped.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');
const publicRoutes = require('./routes/public.routes');
const { UPLOAD_DIR } = require('./middleware/upload');

const app = express();

// Render/Railway/Fly sit behind a reverse proxy — needed for correct req.ip
// (used by the login rate limiter and audit log).
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigins.length > 0 ? env.clientOrigins : false,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Uploaded images (dish photos, ads, gallery) — never executes user content,
// express.static only serves bytes with a content-type based on extension,
// and filenames are server-generated random hex (see middleware/upload.js).
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Admin: cafeId is always the authenticated admin's own cafe — never from the client.
app.use(
  '/api/admin',
  authenticate,
  requireRole('admin'),
  resolveCafeAccess,
  cafeScopedRoutes
);

// Super Admin: global platform management, plus the same cafe-scoped routes
// addressed explicitly by :cafeId for any cafe on the platform.
app.use('/api/superadmin', authenticate, requireRole('super_admin'), superAdminRoutes);
app.use(
  '/api/superadmin/cafes/:cafeId',
  authenticate,
  requireRole('super_admin'),
  resolveCafeAccess,
  cafeScopedRoutes
);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
