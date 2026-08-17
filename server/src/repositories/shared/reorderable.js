const { withTransaction } = require('../../config/db');

// tableName is always a hardcoded literal passed by our own repository code
// (never derived from request input), so string interpolation here is safe.
// Reorders rows of `tableName` scoped to cafeId according to orderedIds —
// any id not owned by this cafe is silently skipped (tenant isolation).
async function reorderScoped(tableName, cafeId, orderedIds) {
  await withTransaction(async (client) => {
    for (let i = 0; i < orderedIds.length; i += 1) {
      await client.query(
        `UPDATE ${tableName} SET position = $1 WHERE id = $2 AND cafe_id = $3`,
        [i, orderedIds[i], cafeId]
      );
    }
  });
}

module.exports = { reorderScoped };
