import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const [role, name, email, password, departmentId] = process.argv.slice(2);

const run = async () => {
  if (!['officer', 'admin'].includes(role) || !name || !email || !password) {
    console.log('Usage: node src/utils/createStaff.js <officer|admin> <name> <email> <password> [departmentId]');
    process.exit(1);
  }
  if (role === 'officer' && !departmentId) {
    console.log('Officer needs a departmentId');
    process.exit(1);
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log('This email already exists');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, role === 'officer' ? departmentId : null]
  );

  console.log(`${role} created: ${email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});