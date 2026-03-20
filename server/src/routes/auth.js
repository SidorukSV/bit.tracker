import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, fullName, role = 'MEMBER' } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'email, password, fullName required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1,$2,$3,$4)
     RETURNING id, email, full_name, role`,
    [email, passwordHash, fullName, role]
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    token
  });
});

export default router;
