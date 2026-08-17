const { query, withTransaction } = require('../config/db');
const cafeRepository = require('../repositories/cafeRepository');
const dishRepository = require('../repositories/dishRepository');
const menuBlockRepository = require('../repositories/menuBlockRepository');
const cafeSettingsRepository = require('../repositories/cafeSettingsRepository');

/**
 * Assembles the full current draft state of a cafe's menu into one JSON
 * object. Used both for the admin live preview (draft, unsaved to
 * menu_publications) and as the payload frozen into a publication on publish.
 */
async function buildSnapshot(cafeId) {
  const cafe = await cafeRepository.findById(cafeId);
  const [
    settings,
    theme,
    workingHours,
    languages,
    categoriesRes,
    dishes,
    menuBlocks,
    adsRes,
    galleryRes,
    contactsRes,
  ] = await Promise.all([
    cafeSettingsRepository.getCafeSettings(cafeId),
    cafeSettingsRepository.getTheme(cafeId),
    cafeSettingsRepository.getWorkingHours(cafeId),
    cafeSettingsRepository.getLanguages(cafeId),
    query(`SELECT * FROM categories WHERE cafe_id = $1 AND is_enabled = true ORDER BY position`, [cafeId]),
    dishRepository.list(cafeId),
    menuBlockRepository.list(cafeId),
    query(`SELECT * FROM advertisements WHERE cafe_id = $1 AND is_enabled = true ORDER BY position`, [cafeId]),
    query(`SELECT * FROM gallery WHERE cafe_id = $1 AND is_enabled = true ORDER BY position`, [cafeId]),
    query(`SELECT * FROM contacts WHERE cafe_id = $1 AND is_enabled = true ORDER BY position`, [cafeId]),
  ]);

  return {
    cafe: { id: cafe.id, name: cafe.name, slug: cafe.slug },
    settings,
    theme,
    workingHours,
    languages: languages.filter((l) => l.isEnabled),
    categories: categoriesRes.rows.map((c) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.image_url,
      position: c.position,
    })),
    dishes: dishes
      .filter((d) => d.isEnabled)
      .map((d) => ({
        ...d,
        attributes: d.attributes.filter((a) => a.isVisible),
      })),
    menuBlocks: menuBlocks.filter((b) => b.isEnabled),
    advertisements: adsRes.rows.map((a) => ({ id: a.id, imageUrl: a.image_url, position: a.position })),
    gallery: galleryRes.rows.map((g) => ({
      id: g.id,
      imageUrl: g.image_url,
      category: g.category,
      position: g.position,
    })),
    contacts: contactsRes.rows.map((c) => ({ id: c.id, type: c.type, value: c.value, position: c.position })),
    generatedAt: new Date().toISOString(),
  };
}

async function publish(cafeId, userId) {
  const snapshot = await buildSnapshot(cafeId);
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO menu_publications (cafe_id, snapshot, published_by) VALUES ($1, $2, $3) RETURNING id, published_at`,
      [cafeId, JSON.stringify(snapshot), userId]
    );
    await client.query(`UPDATE cafes SET is_published = true WHERE id = $1`, [cafeId]);
    return { publicationId: rows[0].id, publishedAt: rows[0].published_at, snapshot };
  });
}

async function getLatestPublication(cafeId) {
  const { rows } = await query(
    `SELECT snapshot, published_at FROM menu_publications WHERE cafe_id = $1 ORDER BY published_at DESC LIMIT 1`,
    [cafeId]
  );
  return rows[0] ? { snapshot: rows[0].snapshot, publishedAt: rows[0].published_at } : null;
}

async function getPublishedBySlug(slug) {
  const cafe = await cafeRepository.findBySlug(slug);
  if (!cafe || cafe.status !== 'active' || !cafe.isPublished) return null;
  const publication = await getLatestPublication(cafe.id);
  if (!publication) return null;
  return { cafeId: cafe.id, ...publication };
}

async function recordStatEvent(cafeId, eventType, entityId = null) {
  await query(
    `INSERT INTO statistics (cafe_id, event_type, entity_id) VALUES ($1, $2, $3)`,
    [cafeId, eventType, entityId]
  );
}

module.exports = { buildSnapshot, publish, getLatestPublication, getPublishedBySlug, recordStatEvent };
