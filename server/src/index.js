import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { ensureBucket } from './services/minio.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import projectRoutes from './routes/projects.js';
import spaceRoutes from './routes/spaces.js';
import boardRoutes from './routes/boards.js';
import taskRoutes from './routes/tasks.js';
import fileRoutes from './routes/files.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

app.use('/api/spaces', requireAuth, spaceRoutes);
app.use('/api/teams', requireAuth, teamRoutes);
app.use('/api/projects', requireAuth, projectRoutes);
app.use('/api/boards', requireAuth, boardRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/files', requireAuth, fileRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

await ensureBucket();
app.listen(config.port, () => {
  console.log(`API listening on :${config.port}`);
});
