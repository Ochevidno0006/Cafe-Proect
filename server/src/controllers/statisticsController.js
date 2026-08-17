const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const cafeId = req.cafeId;
  const [byType, topDishes] = await Promise.all([
    query(
      `SELECT event_type, COUNT(*) AS count
       FROM statistics WHERE cafe_id = $1 AND created_at > now() - interval '30 days'
       GROUP BY event_type`,
      [cafeId]
    ),
    query(
      `SELECT s.entity_id AS dish_id, d.name, COUNT(*) AS views
       FROM statistics s
       JOIN dishes d ON d.id = s.entity_id
       WHERE s.cafe_id = $1 AND s.event_type = 'dish_view' AND s.created_at > now() - interval '30 days'
       GROUP BY s.entity_id, d.name
       ORDER BY views DESC
       LIMIT 10`,
      [cafeId]
    ),
  ]);

  const counts = Object.fromEntries(byType.rows.map((r) => [r.event_type, Number(r.count)]));
  res.json({
    last30Days: {
      menuViews: counts.menu_view || 0,
      dishViews: counts.dish_view || 0,
      categoryViews: counts.category_view || 0,
      qrScans: counts.qr_scan || 0,
      linkOpens: counts.link_open || 0,
    },
    topDishes: topDishes.rows.map((r) => ({ dishId: r.dish_id, name: r.name, views: Number(r.views) })),
  });
});

module.exports = { overview };
