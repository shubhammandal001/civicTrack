import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async ({ name, email, passwordHash, phone }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, phone || null, 'citizen']
  );
  return result.insertId;
};

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, department_id, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};