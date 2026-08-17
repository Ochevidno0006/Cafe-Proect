const { query, withTransaction } = require('../config/db');

function mapBlock(row) {
  if (!row) return null;
  return {
    id: row.id,
    cafeId: row.cafe_id,
    name: row.name,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function attachDishIds(block) {
  if (!block) return block;
  const { rows } = await query(
    `SELECT dish_id FROM menu_block_dishes WHERE block_id = $1 ORDER BY position ASC`,
    [block.id]
  );
  return { ...block, dishIds: rows.map((r) => r.dish_id) };
}

async function list(cafeId) {
  const { rows } = await query(
    `SELECT * FROM menu_blocks WHERE cafe_id = $1 ORDER BY position ASC, created_at ASC`,
    [cafeId]
  );
  return Promise.all(rows.map(mapBlock).map(attachDishIds));
}

async function findByIdScoped(id, cafeId) {
  const { rows } = await query(`SELECT * FROM menu_blocks WHERE id = $1 AND cafe_id = $2`, [
    id,
    cafeId,
  ]);
  return attachDishIds(mapBlock(rows[0]));
}

async function create(cafeId, { name, position = 0, isEnabled = true }) {
  const { rows } = await query(
    `INSERT INTO menu_blocks (cafe_id, name, position, is_enabled) VALUES ($1, $2, $3, $4) RETURNING *`,
    [cafeId, name, position, isEnabled]
  );
  return attachDishIds(mapBlock(rows[0]));
}

// "Дублировать" (item 8) — copies name/enabled state and the curated dish list.
async function duplicateScoped(id, cafeId) {
  const original = await findByIdScoped(id, cafeId);
  if (!original) return null;
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO menu_blocks (cafe_id, name, position, is_enabled)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cafeId, `${original.name} (копия)`, original.position + 1, original.isEnabled]
    );
    const copy = mapBlock(rows[0]);
    for (let i = 0; i < original.dishIds.length; i += 1) {
      await client.query(
        `INSERT INTO menu_block_dishes (block_id, dish_id, position) VALUES ($1, $2, $3)`,
        [copy.id, original.dishIds[i], i]
      );
    }
    return { ...copy, dishIds: original.dishIds };
  });
}

async function updateScoped(id, cafeId, patch) {
  const fields = [];
  const values = [];
  let i = 1;
  const columnMap = { name: 'name', position: 'position', isEnabled: 'is_enabled' };
  for (const [key, column] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      fields.push(`${column} = $${i}`);
      values.push(patch[key]);
      i += 1;
    }
  }
  if (fields.length > 0) {
    values.push(id, cafeId);
    await query(`UPDATE menu_blocks SET ${fields.join(', ')} WHERE id = $${i} AND cafe_id = $${i + 1}`, values);
  }
  return findByIdScoped(id, cafeId);
}

async function removeScoped(id, cafeId) {
  const { rows } = await query(`DELETE FROM menu_blocks WHERE id = $1 AND cafe_id = $2 RETURNING id`, [
    id,
    cafeId,
  ]);
  return rows[0];
}

async function assertOwnedByCafe(blockId, cafeId) {
  const { rows } = await query(`SELECT id FROM menu_blocks WHERE id = $1 AND cafe_id = $2`, [
    blockId,
    cafeId,
  ]);
  return Boolean(rows[0]);
}

// Sets the full curated dish list for a block. dishIds are re-validated to
// belong to the same cafe so a block can never reference another cafe's dish.
async function setDishes(blockId, cafeId, dishIds) {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM menu_block_dishes WHERE block_id = $1`, [blockId]);
    for (let i = 0; i < dishIds.length; i += 1) {
      const { rows } = await client.query(`SELECT id FROM dishes WHERE id = $1 AND cafe_id = $2`, [
        dishIds[i],
        cafeId,
      ]);
      if (rows.length === 0) continue; // silently skip cross-tenant / unknown ids
      await client.query(
        `INSERT INTO menu_block_dishes (block_id, dish_id, position) VALUES ($1, $2, $3)`,
        [blockId, dishIds[i], i]
      );
    }
  });
}

module.exports = {
  list,
  findByIdScoped,
  create,
  duplicateScoped,
  updateScoped,
  removeScoped,
  assertOwnedByCafe,
  setDishes,
};
