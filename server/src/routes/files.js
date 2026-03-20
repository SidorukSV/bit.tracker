import { Router } from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { getDownloadUrl, getUploadUrl } from '../services/minio.js';

const router = Router();

router.post('/task/:taskId/presign-upload', async (req, res) => {
  const { taskId } = req.params;
  const { filename } = req.body;
  const objectKey = `${taskId}/${randomUUID()}-${filename}`;
  const uploadUrl = await getUploadUrl(objectKey);

  const saved = await query(
    'INSERT INTO task_files (task_id, object_key, filename, uploaded_by) VALUES ($1,$2,$3,$4) RETURNING *',
    [taskId, objectKey, filename, req.user.sub]
  );

  return res.status(201).json({ file: saved.rows[0], uploadUrl });
});

router.get('/task/:taskId', async (req, res) => {
  const result = await query('SELECT * FROM task_files WHERE task_id = $1 ORDER BY created_at DESC', [req.params.taskId]);
  return res.json(result.rows);
});

router.get('/:fileId/download-link', async (req, res) => {
  const file = await query('SELECT * FROM task_files WHERE id = $1', [req.params.fileId]);
  if (!file.rows[0]) {
    return res.status(404).json({ error: 'File not found' });
  }
  const downloadUrl = await getDownloadUrl(file.rows[0].object_key);
  return res.json({ downloadUrl });
});

export default router;
