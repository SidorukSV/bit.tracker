import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/project/:projectId', async (req, res) => {
  const result = await query('SELECT * FROM boards WHERE project_id = $1 ORDER BY created_at DESC', [req.params.projectId]);
  return res.json(result.rows);
});

router.post('/project/:projectId', async (req, res) => {
  const { name } = req.body;
  const result = await query(
    'INSERT INTO boards (project_id, name) VALUES ($1,$2) RETURNING *',
    [req.params.projectId, name]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:boardId/columns', async (req, res) => {
  const { title, position = 0 } = req.body;
  const result = await query(
    'INSERT INTO board_columns (board_id, title, position) VALUES ($1,$2,$3) RETURNING *',
    [req.params.boardId, title, position]
  );
  return res.status(201).json(result.rows[0]);
});

export default router;
