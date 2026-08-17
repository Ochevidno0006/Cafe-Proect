const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ensureTestDatabase } = require('./testDb');

let app, pool, server, baseUrl;

before(async () => {
  await ensureTestDatabase(); // creates/migrates a *_test database, sets DATABASE_URL

  // Required only now, so they pick up the test DATABASE_URL set above —
  // this is what keeps `npm test` from ever touching your dev database.
  app = require('../src/app');
  ({ pool } = require('../src/config/db'));

  await pool.query('TRUNCATE users, cafes, login_attempts RESTART IDENTITY CASCADE');
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

async function post(path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function get(path, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function patch(path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

let adminAToken, adminACafeSlug, categoryAId;
let adminBToken;

test('health check responds ok', async () => {
  const { status, data } = await get('/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
});

test('registers Admin A with a cafe', async () => {
  const { status, data } = await post('/api/auth/register', {
    firstName: 'Aziz', lastName: 'R', phone: '+992900000001',
    cafeName: 'Test Cafe A', password: 'password123', passwordConfirm: 'password123',
  });
  assert.equal(status, 201);
  assert.equal(data.user.role, 'admin');
  assert.ok(data.cafe.slug);
  adminAToken = data.accessToken;
  adminACafeSlug = data.cafe.slug;
});

test('rejects registration with mismatched passwords', async () => {
  const { status, data } = await post('/api/auth/register', {
    firstName: 'X', lastName: 'Y', phone: '+992900000099',
    cafeName: 'Bad Cafe', password: 'password123', passwordConfirm: 'password124',
  });
  assert.equal(status, 400);
  assert.equal(data.error.code, 'BAD_REQUEST');
});

test('rejects duplicate phone registration', async () => {
  const { status, data } = await post('/api/auth/register', {
    firstName: 'Dup', lastName: 'Licate', phone: '+992900000001',
    cafeName: 'Another Cafe', password: 'password123', passwordConfirm: 'password123',
  });
  assert.equal(status, 409);
  assert.equal(data.error.code, 'CONFLICT');
});

test('registers Admin B with a separate cafe', async () => {
  const { status, data } = await post('/api/auth/register', {
    firstName: 'Bahrom', lastName: 'N', phone: '+992900000002',
    cafeName: 'Test Cafe B', password: 'password123', passwordConfirm: 'password123',
  });
  assert.equal(status, 201);
  adminBToken = data.accessToken;
});

test('rejects wrong password on login', async () => {
  const { status, data } = await post('/api/auth/login', { phone: '+992900000001', password: 'wrong-password' });
  assert.equal(status, 401);
  assert.equal(data.error.code, 'UNAUTHORIZED');
});

test('Admin A creates a category in their own cafe', async () => {
  const { status, data } = await post('/api/admin/categories', { name: 'Завтраки' }, adminAToken);
  assert.equal(status, 201);
  categoryAId = data.category.id;
});

test('tenant isolation: Admin B sees an empty category list', async () => {
  const { status, data } = await get('/api/admin/categories', adminBToken);
  assert.equal(status, 200);
  assert.deepEqual(data.categories, []);
});

test('tenant isolation: Admin B cannot PATCH Admin A category by id', async () => {
  const { status, data } = await patch(`/api/admin/categories/${categoryAId}`, { name: 'HACKED' }, adminBToken);
  assert.equal(status, 404);
  assert.equal(data.error.code, 'NOT_FOUND');
});

test("Admin A's category survived the cross-tenant attempt unchanged", async () => {
  const { data } = await get('/api/admin/categories', adminAToken);
  assert.equal(data.categories[0].name, 'Завтраки');
});

test('Admin cannot access Super Admin routes', async () => {
  const { status } = await get('/api/superadmin/admins', adminAToken);
  assert.equal(status, 403);
});

test('unauthenticated request is rejected', async () => {
  const { status } = await get('/api/admin/categories');
  assert.equal(status, 401);
});

test('publishing then fetching the public menu works end to end', async () => {
  const pub = await post('/api/admin/publish', {}, adminAToken);
  assert.equal(pub.status, 201);
  const { status, data } = await get(`/api/public/menu/${adminACafeSlug}`);
  assert.equal(status, 200);
  assert.equal(data.menu.categories.length, 1);
});

test('audit log records the actions taken by Admin A', async () => {
  const { status, data } = await get('/api/admin/audit-log', adminAToken);
  assert.equal(status, 200);
  const actions = data.entries.map((e) => e.action);
  assert.ok(actions.includes('category_created'));
  assert.ok(actions.includes('menu_published'));
});
