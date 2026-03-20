import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/board/:boardId', async (req, res) => {
  const result = await query('SELECT * FROM tasks WHERE board_id = $1 ORDER BY created_at DESC', [req.params.boardId]);
  return res.json(result.rows);
});

router.post('/board/:boardId', async (req, res) => {
  const { title, description, dueDate, assigneeId, columnId } = req.body;
  const result = await query(
    `INSERT INTO tasks (board_id, column_id, title, description, due_date, author_id, assignee_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [req.params.boardId, columnId ?? null, title, description ?? null, dueDate ?? null, req.user.sub, assigneeId ?? null]
  );
  return res.status(201).json(result.rows[0]);
});

router.patch('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { title, description, dueDate, assigneeId, columnId } = req.body;
  const result = await query(
    `UPDATE tasks
     SET title = COALESCE($2,title),
         description = COALESCE($3,description),
         due_date = COALESCE($4,due_date),
         assignee_id = COALESCE($5,assignee_id),
         column_id = COALESCE($6,column_id),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [taskId, title ?? null, description ?? null, dueDate ?? null, assigneeId ?? null, columnId ?? null]
  );
  return res.json(result.rows[0]);
});

router.post('/:taskId/watchers/:userId', async (req, res) => {
  await query(
    'INSERT INTO task_watchers (task_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [req.params.taskId, req.params.userId]
  );
  return res.status(204).send();
});

router.post('/:taskId/comments', async (req, res) => {
  const result = await query(
    'INSERT INTO task_comments (task_id, author_id, body) VALUES ($1,$2,$3) RETURNING *',
    [req.params.taskId, req.user.sub, req.body.body]
  );
  return res.status(201).json(result.rows[0]);
});

router.post('/:taskId/custom-fields/:fieldId', async (req, res) => {
  await query(
    `INSERT INTO task_custom_field_values (task_id, field_id, value)
     VALUES ($1,$2,$3)
     ON CONFLICT (task_id, field_id) DO UPDATE SET value = EXCLUDED.value`,
    [req.params.taskId, req.params.fieldId, req.body.value ?? null]
  );
  return res.status(204).send();
});

export default router;
