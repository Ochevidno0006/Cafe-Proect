const { query } = require('../config/db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

async function create(client, { ownerUserId, name, slug }) {
  const { rows } = await client.query(
    `INSERT INTO cafes (owner_user_id, name, slug) VALUES ($1, $2, $3)
     RETURNING id, owner_user_id, name, slug, status, is_published, created_at`,
    [ownerUserId, name, slug]
  );
  return mapRow(rows[0]);
}

async function findById(id) {
  const { rows } = await query(`SELECT * FROM cafes WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return mapRow(rows[0]);
}

async function findBySlug(slug) {
  const { rows } = await query(`SELECT * FROM cafes WHERE slug = $1 AND deleted_at IS NULL`, [slug]);
  return mapRow(rows[0]);
}

async function findByOwnerId(ownerUserId) {
  const { rows } = await query(
    `SELECT * FROM cafes WHERE owner_user_id = $1 AND deleted_at IS NULL`,
    [ownerUserId]
  );
  return mapRow(rows[0]);
}

async function listAll({ limit = 50, offset = 0 } = {}) {
  const { rows } = await query(
    `SELECT * FROM cafes WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map(mapRow);
}

module.exports = { create, findById, findBySlug, findByOwnerId, listAll };
