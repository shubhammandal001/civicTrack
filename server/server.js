import 'dotenv/config';
import pool from './src/config/db.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import complaintRoutes from './src/routes/complaintRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import officerRoutes from './src/routes/officerRoutes.js';

import { protect } from './src/middleware/authMiddleware.js';
import { upload } from './src/middleware/uploadMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'CivicTrack API is running' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ db: 'connected', result: rows[0].result });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/officer', officerRoutes);

app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});