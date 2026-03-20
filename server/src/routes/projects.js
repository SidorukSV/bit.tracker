import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
  return res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const result = await query(
    'INSERT INTO projects (name, description, created_by) VALUES ($1,$2,$3) RETURNING *',
    [name, description ?? null, req.user.sub]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:projectId/teams/:teamId', async (req, res) => {
  const { projectId, teamId } = req.params;
  await query(
    'INSERT INTO project_teams (project_id, team_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [projectId, teamId]
  );
  return res.status(204).send();
});

router.post('/:projectId/members/:userId', async (req, res) => {
  const { projectId, userId } = req.params;
  await query(
    'INSERT INTO project_members (project_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [projectId, userId]
  );
  return res.status(204).send();
});

router.post('/:projectId/custom-fields', async (req, res) => {
  const { projectId } = req.params;
  const { name, fieldType, options } = req.body;
  const result = await query(
    `INSERT INTO project_custom_fields (project_id, name, field_type, options)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [projectId, name, fieldType, options ?? null]
  );
  return res.status(201).json(result.rows[0]);
});

export default router;
