const { query } = require('../config/db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    cafeId: row.cafe_id,
    imageUrl: row.image_url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
  };
}

async function list(cafeId) {
  const { rows } = await query(
    `SELECT * FROM advertisements WHERE cafe_id = $1 ORDER BY position ASC, created_at ASC`,
    [cafeId]
  );
  return rows.map(mapRow);
}

async function findByIdScoped(id, cafeId) {
  const { rows } = await query(`SELECT * FROM advertisements WHERE id = $1 AND cafe_id = $2`, [id, cafeId]);
  return mapRow(rows[0]);
}

async function create(cafeId, { imageUrl, position = 0, isEnabled = true }) {
  const { rows } = await query(
    `INSERT INTO advertisements (cafe_id, image_url, position, is_enabled) VALUES ($1, $2, $3, $4) RETURNING *`,
    [cafeId, imageUrl, position, isEnabled]
  );
  return mapRow(rows[0]);
}

async function updateScoped(id, cafeId, patch) {
  const fields = [];
  const values = [];
  let i = 1;
  const columnMap = { imageUrl: 'image_url', position: 'position', isEnabled: 'is_enabled' };
  for (const [key, column] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      fields.push(`${column} = $${i}`);
      values.push(patch[key]);
      i += 1;
    }
  }
  if (fields.length === 0) return findByIdScoped(id, cafeId);
  values.push(id, cafeId);
  const { rows } = await query(
    `UPDATE advertisements SET ${fields.join(', ')} WHERE id = $${i} AND cafe_id = $${i + 1} RETURNING *`,
    values
  );
  return mapRow(rows[0]);
}

async function removeScoped(id, cafeId) {
  const { rows } = await query(`DELETE FROM advertisements WHERE id = $1 AND cafe_id = $2 RETURNING id`, [
    id,
    cafeId,
  ]);
  return rows[0];
}

module.exports = { list, findByIdScoped, create, updateScoped, removeScoped };
