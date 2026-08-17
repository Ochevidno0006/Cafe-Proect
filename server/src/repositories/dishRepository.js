const { query, withTransaction } = require('../config/db');

const ATTR_KEYS = ['ingredients', 'weight', 'calories', 'allergens', 'spiciness', 'prep_time'];
const LABEL_KEYS = ['popular', 'new', 'recommended', 'spicy', 'vegetarian', 'promo'];

function mapDish(row) {
  if (!row) return null;
  return {
    id: row.id,
    cafeId: row.cafe_id,
    categoryId: row.category_id,
    name: row.name,
    price: Number(row.price),
    description: row.description,
    photoUrl: row.photo_url,
    rating: row.rating,
    isAvailable: row.is_available,
    isEnabled: row.is_enabled,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAttribute(row) {
  return { key: row.attr_key, value: row.attr_value, isVisible: row.is_visible };
}

function mapTranslation(row) {
  return { languageCode: row.language_code, name: row.name, description: row.description };
}

async function attachRelations(dish) {
  if (!dish) return dish;
  const [attrs, translations, labels] = await Promise.all([
    query(`SELECT attr_key, attr_value, is_visible FROM dish_attributes WHERE dish_id = $1`, [dish.id]),
    query(`SELECT language_code, name, description FROM dish_translations WHERE dish_id = $1`, [dish.id]),
    query(`SELECT label FROM dish_labels WHERE dish_id = $1`, [dish.id]),
  ]);
  return {
    ...dish,
    attributes: attrs.rows.map(mapAttribute),
    translations: translations.rows.map(mapTranslation),
    labels: labels.rows.map((r) => r.label),
  };
}

async function list(cafeId, { categoryId } = {}) {
  const params = [cafeId];
  let where = 'WHERE cafe_id = $1';
  if (categoryId) {
    params.push(categoryId);
    where += ` AND category_id = $${params.length}`;
  }
  const { rows } = await query(
    `SELECT * FROM dishes ${where} ORDER BY position ASC, created_at ASC`,
    params
  );
  const dishes = rows.map(mapDish);
  return Promise.all(dishes.map(attachRelations));
}

async function findByIdScoped(id, cafeId) {
  const { rows } = await query(`SELECT * FROM dishes WHERE id = $1 AND cafe_id = $2`, [id, cafeId]);
  return attachRelations(mapDish(rows[0]));
}

async function create(cafeId, data) {
  const dish = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO dishes (cafe_id, category_id, name, price, description, photo_url, rating, is_available, is_enabled, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        cafeId,
        data.categoryId ?? null,
        data.name,
        data.price ?? 0,
        data.description ?? null,
        data.photoUrl ?? null,
        data.rating ?? 0,
        data.isAvailable ?? true,
        data.isEnabled ?? true,
        data.position ?? 0,
      ]
    );
    const newDish = mapDish(rows[0]);

    // Seed all attribute rows (hidden by default) so the client can PATCH them individually later.
    for (const key of ATTR_KEYS) {
      await client.query(
        `INSERT INTO dish_attributes (dish_id, attr_key, attr_value, is_visible) VALUES ($1, $2, NULL, false)`,
        [newDish.id, key]
      );
    }
    return newDish;
  });
  return attachRelations(dish);
}

async function updateScoped(id, cafeId, patch) {
  const fields = [];
  const values = [];
  let i = 1;
  const columnMap = {
    categoryId: 'category_id',
    name: 'name',
    price: 'price',
    description: 'description',
    photoUrl: 'photo_url',
    rating: 'rating',
    isAvailable: 'is_available',
    isEnabled: 'is_enabled',
    position: 'position',
  };
  for (const [key, column] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      fields.push(`${column} = $${i}`);
      values.push(patch[key]);
      i += 1;
    }
  }
  if (fields.length > 0) {
    values.push(id, cafeId);
    await query(
      `UPDATE dishes SET ${fields.join(', ')} WHERE id = $${i} AND cafe_id = $${i + 1}`,
      values
    );
  }
  return findByIdScoped(id, cafeId);
}

async function removeScoped(id, cafeId) {
  const { rows } = await query(`DELETE FROM dishes WHERE id = $1 AND cafe_id = $2 RETURNING id`, [
    id,
    cafeId,
  ]);
  return rows[0];
}

// Verifies the dish belongs to cafeId before touching its sub-resources —
// every helper below is called only after this check by the controller.
async function assertOwnedByCafe(dishId, cafeId) {
  const { rows } = await query(`SELECT id FROM dishes WHERE id = $1 AND cafe_id = $2`, [
    dishId,
    cafeId,
  ]);
  return Boolean(rows[0]);
}

async function setAttributes(dishId, attributes) {
  await withTransaction(async (client) => {
    for (const attr of attributes) {
      if (!ATTR_KEYS.includes(attr.key)) continue;
      await client.query(
        `INSERT INTO dish_attributes (dish_id, attr_key, attr_value, is_visible)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (dish_id, attr_key) DO UPDATE SET attr_value = $3, is_visible = $4`,
        [dishId, attr.key, attr.value ?? null, Boolean(attr.isVisible)]
      );
    }
  });
}

async function setTranslation(dishId, languageCode, { name, description }) {
  await query(
    `INSERT INTO dish_translations (dish_id, language_code, name, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (dish_id, language_code) DO UPDATE SET name = $3, description = $4`,
    [dishId, languageCode, name ?? null, description ?? null]
  );
}

async function setLabels(dishId, labels) {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM dish_labels WHERE dish_id = $1`, [dishId]);
    for (const label of labels) {
      if (!LABEL_KEYS.includes(label)) continue;
      await client.query(`INSERT INTO dish_labels (dish_id, label) VALUES ($1, $2)`, [dishId, label]);
    }
  });
}

module.exports = {
  ATTR_KEYS,
  LABEL_KEYS,
  list,
  findByIdScoped,
  create,
  updateScoped,
  removeScoped,
  assertOwnedByCafe,
  setAttributes,
  setTranslation,
  setLabels,
};
