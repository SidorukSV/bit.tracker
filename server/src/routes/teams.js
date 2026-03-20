import { Router } from 'express';
import { query } from '../db.js';
import { requireSpaceAdminOrOwner, requireSpaceMember } from '../middleware/spaceAuth.js';

const router = Router();

router.get('/', requireSpaceMember, async (req, res) => {
  const result = await query(
    'SELECT * FROM teams WHERE space_id = $1 ORDER BY created_at DESC',
    [req.spaceId]
  );
  return res.json(result.rows);
});

router.post('/', requireSpaceAdminOrOwner, async (req, res) => {
  const { name, parentTeamId = null } = req.body;
  const result = await query(
    'INSERT INTO teams (space_id, name, parent_team_id) VALUES ($1,$2,$3) RETURNING *',
    [req.spaceId, name, parentTeamId]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:teamId/members/:userId', requireSpaceAdminOrOwner, async (req, res) => {
  const { teamId, userId } = req.params;
  const { role = 'MEMBER' } = req.body;
  await query(
    'INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role',
    [teamId, userId, role]
  );
  return res.status(204).send();
});

router.delete('/:teamId/members/:userId', requireSpaceAdminOrOwner, async (req, res) => {
  const { teamId, userId } = req.params;
  await query('DELETE FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
  return res.status(204).send();
});

export default router;
