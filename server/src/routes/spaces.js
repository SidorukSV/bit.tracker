import { Router } from 'express';
import { query } from '../db.js';
import { requireSpaceAdminOrOwner, requireSpaceMember } from '../middleware/spaceAuth.js';

const router = Router();

router.get('/', async (req, res) => {
  const result = await query(
    `SELECT s.*, sm.role AS my_role
     FROM spaces s
     JOIN space_members sm ON sm.space_id = s.id
     WHERE sm.user_id = $1
     ORDER BY s.created_at DESC`,
    [req.user.sub]
  );

  return res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const created = await query(
    'INSERT INTO spaces (name, owner_id) VALUES ($1,$2) RETURNING *',
    [name, req.user.sub]
  );

  await query(
    'INSERT INTO space_members (space_id, user_id, role) VALUES ($1,$2,$3)',
    [created.rows[0].id, req.user.sub, 'OWNER']
  );

  return res.status(201).json(created.rows[0]);
});

router.get('/:spaceId/members', requireSpaceMember, async (req, res) => {
  const result = await query(
    `SELECT sm.space_id, sm.user_id, sm.role, u.email, u.full_name
     FROM space_members sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.space_id = $1
     ORDER BY u.full_name`,
    [req.spaceId]
  );

  return res.json(result.rows);
});

router.post('/:spaceId/members', requireSpaceAdminOrOwner, async (req, res) => {
  const { userId, role = 'MEMBER' } = req.body;
  await query(
    `INSERT INTO space_members (space_id, user_id, role)
     VALUES ($1,$2,$3)
     ON CONFLICT (space_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
    [req.spaceId, userId, role]
  );

  return res.status(204).send();
});

export default router;
