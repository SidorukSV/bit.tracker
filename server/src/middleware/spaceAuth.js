import { query } from '../db.js';

export async function requireSpaceMember(req, res, next) {
  const spaceId = req.params.spaceId || req.body.spaceId || req.query.spaceId;
  if (!spaceId) {
    return res.status(400).json({ error: 'spaceId is required' });
  }

  const membership = await query(
    'SELECT role FROM space_members WHERE space_id = $1 AND user_id = $2',
    [spaceId, req.user.sub]
  );

  if (!membership.rows[0]) {
    return res.status(403).json({ error: 'No access to this space' });
  }

  req.spaceId = spaceId;
  req.spaceRole = membership.rows[0].role;
  return next();
}

export async function requireSpaceAdminOrOwner(req, res, next) {
  const spaceId = req.params.spaceId || req.body.spaceId || req.query.spaceId;
  if (!spaceId) {
    return res.status(400).json({ error: 'spaceId is required' });
  }

  const membership = await query(
    'SELECT role FROM space_members WHERE space_id = $1 AND user_id = $2',
    [spaceId, req.user.sub]
  );

  const role = membership.rows[0]?.role;
  if (!role || (role !== 'OWNER' && role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Owner/Admin role required for this action' });
  }

  req.spaceId = spaceId;
  req.spaceRole = role;
  return next();
}
