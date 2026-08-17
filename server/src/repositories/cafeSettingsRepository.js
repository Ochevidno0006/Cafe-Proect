const { query, withTransaction } = require('../config/db');

// --- cafe_settings ------------------------------------------------------
function mapCafeSettings(row) {
  if (!row) return null;
  return {
    cafeId: row.cafe_id,
    searchEnabled: row.search_enabled,
    favoritesEnabled: row.favorites_enabled,
    shareEnabled: row.share_enabled,
    labelsEnabled: row.labels_enabled,
    sectionOrder: row.section_order,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

async function getCafeSettings(cafeId) {
  const { rows } = await query(`SELECT * FROM cafe_settings WHERE cafe_id = $1`, [cafeId]);
  return mapCafeSettings(rows[0]);
}

async function updateCafeSettings(cafeId, patch) {
  const fields = [];
  const values = [];
  let i = 1;
  const columnMap = {
    searchEnabled: 'search_enabled',
    favoritesEnabled: 'favorites_enabled',
    shareEnabled: 'share_enabled',
    labelsEnabled: 'labels_enabled',
    status: 'status',
  };
  for (const [key, column] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      fields.push(`${column} = $${i}`);
      values.push(patch[key]);
      i += 1;
    }
  }
  if (patch.sectionOrder !== undefined) {
    fields.push(`section_order = $${i}`);
    values.push(JSON.stringify(patch.sectionOrder));
    i += 1;
  }
  if (fields.length === 0) return getCafeSettings(cafeId);
  values.push(cafeId);
  const { rows } = await query(
    `UPDATE cafe_settings SET ${fields.join(', ')} WHERE cafe_id = $${i} RETURNING *`,
    values
  );
  return mapCafeSettings(rows[0]);
}

// --- theme_settings -------------------------------------------------------
const THEME_PRESETS = ['modern', 'elegant', 'minimal', 'dark', 'classic', 'restaurant'];

function mapTheme(row) {
  if (!row) return null;
  return {
    cafeId: row.cafe_id,
    preset: row.preset,
    primaryColor: row.primary_color,
    buttonColor: row.button_color,
    backgroundColor: row.background_color,
    textColor: row.text_color,
    cardRadius: row.card_radius,
    cardStyle: row.card_style,
    updatedAt: row.updated_at,
  };
}

async function getTheme(cafeId) {
  const { rows } = await query(`SELECT * FROM theme_settings WHERE cafe_id = $1`, [cafeId]);
  return mapTheme(rows[0]);
}

async function updateTheme(cafeId, patch) {
  const fields = [];
  const values = [];
  let i = 1;
  const columnMap = {
    preset: 'preset',
    primaryColor: 'primary_color',
    buttonColor: 'button_color',
    backgroundColor: 'background_color',
    textColor: 'text_color',
    cardRadius: 'card_radius',
    cardStyle: 'card_style',
  };
  for (const [key, column] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      fields.push(`${column} = $${i}`);
      values.push(patch[key]);
      i += 1;
    }
  }
  if (fields.length === 0) return getTheme(cafeId);
  values.push(cafeId);
  const { rows } = await query(
    `UPDATE theme_settings SET ${fields.join(', ')} WHERE cafe_id = $${i} RETURNING *`,
    values
  );
  return mapTheme(rows[0]);
}

// --- working_hours ----------------------------------------------------
function mapHours(row) {
  return {
    dayOfWeek: row.day_of_week,
    mode: row.mode,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

async function getWorkingHours(cafeId) {
  const { rows } = await query(
    `SELECT * FROM working_hours WHERE cafe_id = $1 ORDER BY day_of_week ASC`,
    [cafeId]
  );
  return rows.map(mapHours);
}

async function setWorkingHours(cafeId, days) {
  await withTransaction(async (client) => {
    for (const day of days) {
      await client.query(
        `UPDATE working_hours SET mode = $1, open_time = $2, close_time = $3
         WHERE cafe_id = $4 AND day_of_week = $5`,
        [day.mode, day.openTime ?? null, day.closeTime ?? null, cafeId, day.dayOfWeek]
      );
    }
  });
  return getWorkingHours(cafeId);
}

// --- cafe_languages -----------------------------------------------------
async function getLanguages(cafeId) {
  const { rows } = await query(
    `SELECT l.code, l.name, COALESCE(cl.is_enabled, false) AS is_enabled
     FROM languages l
     LEFT JOIN cafe_languages cl ON cl.language_code = l.code AND cl.cafe_id = $1
     ORDER BY l.code`,
    [cafeId]
  );
  return rows.map((r) => ({ code: r.code, name: r.name, isEnabled: r.is_enabled }));
}

async function setLanguages(cafeId, languages) {
  await withTransaction(async (client) => {
    for (const lang of languages) {
      await client.query(
        `INSERT INTO cafe_languages (cafe_id, language_code, is_enabled)
         VALUES ($1, $2, $3)
         ON CONFLICT (cafe_id, language_code) DO UPDATE SET is_enabled = $3`,
        [cafeId, lang.code, lang.isEnabled]
      );
    }
  });
  return getLanguages(cafeId);
}

module.exports = {
  THEME_PRESETS,
  getCafeSettings,
  updateCafeSettings,
  getTheme,
  updateTheme,
  getWorkingHours,
  setWorkingHours,
  getLanguages,
  setLanguages,
};
