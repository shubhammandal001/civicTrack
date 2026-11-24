import pool from '../config/db.js';

export const getAllCategories = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, department_id FROM categories ORDER BY name'
  );
  return rows;
};

export const findCategoryById = async (id) => {
  const [rows] = await pool.query('SELECT id, name FROM categories WHERE id = ?', [id]);
  return rows[0];
};