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

export const getOfficers = async () => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.department_id, d.name AS department
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.role = 'officer'
     ORDER BY u.name`
  );
  return rows;
};

export const findOfficerById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, department_id FROM users WHERE id = ? AND role = 'officer'",
    [id]
  );
  return rows[0];
};