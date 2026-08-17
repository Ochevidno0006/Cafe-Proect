const { query } = require('../config/db');

async function log({ actorUserId = null, cafeId = null, action, entityType = null, entityId = null, meta = null }, client = null) {
  const runner = client || { query };
  await runner.query(
    `INSERT INTO audit_logs (actor_user_id, cafe_id, action, entity_type, entity_id, meta)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorUserId, cafeId, action, entityType, entityId, meta ? JSON.stringify(meta) : null]
  );
}

module.exports = { log };
