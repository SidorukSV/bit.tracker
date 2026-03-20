import { Router } from 'express';
import { query } from '../db.js';
import { requireSpaceMember } from '../middleware/spaceAuth.js';

const router = Router();

router.get('/board/:boardId', requireSpaceMember, async (req, res) => {
  const result = await query(
    `SELECT t.*
     FROM tasks t
     JOIN boards b ON b.id = t.board_id
     JOIN projects p ON p.id = b.project_id
     WHERE t.board_id = $1 AND p.space_id = $2
     ORDER BY t.created_at DESC`,
    [req.params.boardId, req.spaceId]
  );
  return res.json(result.rows);
});

router.post('/board/:boardId', requireSpaceMember, async (req, res) => {
  const { title, description, dueDate, assigneeId, columnId } = req.body;
  const result = await query(
    `INSERT INTO tasks (board_id, column_id, title, description, due_date, author_id, assignee_id)
     SELECT b.id, $2, $3, $4, $5, $6, $7
     FROM boards b
     JOIN projects p ON p.id = b.project_id
     WHERE b.id = $1 AND p.space_id = $8
     RETURNING *`,
    [req.params.boardId, columnId ?? null, title, description ?? null, dueDate ?? null, req.user.sub, assigneeId ?? null, req.spaceId]
  );
  return res.status(201).json(result.rows[0]);
});

router.patch('/:taskId', requireSpaceMember, async (req, res) => {
  const { taskId } = req.params;
  const { title, description, dueDate, assigneeId, columnId } = req.body;
  const result = await query(
    `UPDATE tasks t
     SET title = COALESCE($2,t.title),
         description = COALESCE($3,t.description),
         due_date = COALESCE($4,t.due_date),
         assignee_id = COALESCE($5,t.assignee_id),
         column_id = COALESCE($6,t.column_id),
         updated_at = now()
     FROM boards b
     JOIN projects p ON p.id = b.project_id
     WHERE t.id = $1 AND b.id = t.board_id AND p.space_id = $7
     RETURNING t.*`,
    [taskId, title ?? null, description ?? null, dueDate ?? null, assigneeId ?? null, columnId ?? null, req.spaceId]
  );
  return res.json(result.rows[0]);
});

router.post('/:taskId/watchers/:userId', requireSpaceMember, async (req, res) => {
  await query(
    'INSERT INTO task_watchers (task_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [req.params.taskId, req.params.userId]
  );
  return res.status(204).send();
});

router.post('/:taskId/comments', requireSpaceMember, async (req, res) => {
  const result = await query(
    'INSERT INTO task_comments (task_id, author_id, body) VALUES ($1,$2,$3) RETURNING *',
    [req.params.taskId, req.user.sub, req.body.body]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:taskId/custom-fields/:fieldId', requireSpaceMember, async (req, res) => {
  await query(
    `INSERT INTO task_custom_field_values (task_id, field_id, value)
     VALUES ($1,$2,$3)
     ON CONFLICT (task_id, field_id) DO UPDATE SET value = EXCLUDED.value`,
    [req.params.taskId, req.params.fieldId, req.body.value ?? null]
  );
  return res.status(204).send();
});

export default router;
