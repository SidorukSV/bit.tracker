import { Router } from 'express';
import { query } from '../db.js';
import { requireSpaceAdminOrOwner, requireSpaceMember } from '../middleware/spaceAuth.js';

const router = Router();

router.get('/', requireSpaceMember, async (req, res) => {
  const result = await query(
    'SELECT * FROM projects WHERE space_id = $1 ORDER BY created_at DESC',
    [req.spaceId]
  );
  return res.json(result.rows);
});

router.post('/', requireSpaceMember, async (req, res) => {
  const { name, description } = req.body;
  const result = await query(
    'INSERT INTO projects (space_id, name, description, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.spaceId, name, description ?? null, req.user.sub]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:projectId/teams/:teamId', requireSpaceAdminOrOwner, async (req, res) => {
  const { projectId, teamId } = req.params;
  await query(
    'INSERT INTO project_teams (project_id, team_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [projectId, teamId]
  );
  return res.status(204).send();
});

router.post('/:projectId/members/:userId', requireSpaceMember, async (req, res) => {
  const { projectId, userId } = req.params;
  await query(
    'INSERT INTO project_members (project_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [projectId, userId]
  );
  return res.status(204).send();
});

router.delete('/:projectId/members/:userId', requireSpaceAdminOrOwner, async (req, res) => {
  const { projectId, userId } = req.params;
  await query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
  return res.status(204).send();
});

router.post('/:projectId/custom-fields', requireSpaceMember, async (req, res) => {
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
