import { Router } from 'express';
import { query } from '../db.js';
import { requireSpaceMember } from '../middleware/spaceAuth.js';

const router = Router();

router.get('/project/:projectId', requireSpaceMember, async (req, res) => {
  const result = await query(
    `SELECT b.*
     FROM boards b
     JOIN projects p ON p.id = b.project_id
     WHERE b.project_id = $1 AND p.space_id = $2
     ORDER BY b.created_at DESC`,
    [req.params.projectId, req.spaceId]
  );
  return res.json(result.rows);
});

router.post('/project/:projectId', requireSpaceMember, async (req, res) => {
  const { name } = req.body;
  const result = await query(
    `INSERT INTO boards (project_id, name)
     SELECT id, $2 FROM projects WHERE id = $1 AND space_id = $3
     RETURNING *`,
    [req.params.projectId, name, req.spaceId]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:boardId/columns', requireSpaceMember, async (req, res) => {
  const { title, position = 0 } = req.body;
  const result = await query(
    `INSERT INTO board_columns (board_id, title, position)
     SELECT b.id, $2, $3
     FROM boards b
     JOIN projects p ON p.id = b.project_id
     WHERE b.id = $1 AND p.space_id = $4
     RETURNING *`,
    [req.params.boardId, title, position, req.spaceId]
  );
  return res.status(201).json(result.rows[0]);
});

export default router;
