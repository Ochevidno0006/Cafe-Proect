const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const { rows } = await query(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.meta, a.created_at,
            u.first_name, u.last_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.actor_user_id
     WHERE a.cafe_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2`,
    [req.cafeId, limit]
  );
  res.json({
    entries: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      actor: r.first_name ? `${r.first_name} ${r.last_name}` : null,
      createdAt: r.created_at,
    })),
  });
});

// Platform-wide log — Super Admin only, not cafe-scoped.
const listPlatform = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 300);
  const { rows } = await query(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at,
            u.first_name, u.last_name, c.name AS cafe_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.actor_user_id
     LEFT JOIN cafes c ON c.id = a.cafe_id
     ORDER BY a.created_at DESC
     LIMIT $1`,
    [limit]
  );
  res.json({
    entries: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      actor: r.first_name ? `${r.first_name} ${r.last_name}` : null,
      cafeName: r.cafe_name,
      createdAt: r.created_at,
    })),
  });
});

module.exports = { list, listPlatform };
