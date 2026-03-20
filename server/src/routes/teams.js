import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM teams ORDER BY created_at DESC');
  return res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, parentTeamId = null } = req.body;
  const result = await query(
    'INSERT INTO teams (name, parent_team_id) VALUES ($1,$2) RETURNING *',
    [name, parentTeamId]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:teamId/members/:userId', async (req, res) => {
  const { teamId, userId } = req.params;
  await query(
    'INSERT INTO team_members (team_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [teamId, userId]
  );
  return res.status(204).send();
});

export default router;
