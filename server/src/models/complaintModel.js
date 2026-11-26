import pool from '../config/db.js';

export const createComplaintWithImages = async ({
  userId, title, description, categoryId, latitude, longitude, address, imagePaths,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO complaints
        (user_id, title, description, category_id, latitude, longitude, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description, categoryId, latitude, longitude, address || null]
    );
    const complaintId = result.insertId;

    for (const imagePath of imagePaths) {
      await conn.query(
        'INSERT INTO complaint_images (complaint_id, image_path, type) VALUES (?, ?, ?)',
        [complaintId, imagePath, 'complaint']
      );
    }

    await conn.query(
      `INSERT INTO status_history (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES (?, NULL, ?, ?, ?)`,
      [complaintId, 'Submitted', userId, 'Complaint submitted']
    );

    await conn.commit();
    return complaintId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getComplaintsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.title, c.description, c.status, c.priority,
            c.address, c.latitude, c.longitude, c.created_at, c.updated_at,
            cat.name AS category,
            (SELECT image_path FROM complaint_images
              WHERE complaint_id = c.id AND type = 'complaint'
              ORDER BY id LIMIT 1) AS thumbnail
     FROM complaints c
     JOIN categories cat ON cat.id = c.category_id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId]
  );
  return rows;
};

export const getComplaintById = async (id) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.user_id, c.title, c.description, c.status, c.priority,
            c.address, c.latitude, c.longitude, c.assigned_officer_id,
            c.created_at, c.updated_at,
            cat.name AS category,
            u.name AS citizen_name,
            o.name AS officer_name
     FROM complaints c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users u ON u.id = c.user_id
     LEFT JOIN users o ON o.id = c.assigned_officer_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0];
};

export const getImagesByComplaint = async (complaintId) => {
  const [rows] = await pool.query(
    `SELECT id, image_path, type, uploaded_at
     FROM complaint_images WHERE complaint_id = ? ORDER BY id`,
    [complaintId]
  );
  return rows;
};

export const getStatusHistory = async (complaintId) => {
  const [rows] = await pool.query(
    `SELECT h.id, h.old_status, h.new_status, h.remarks, h.created_at,
            u.name AS changed_by_name
     FROM status_history h
     LEFT JOIN users u ON u.id = h.changed_by
     WHERE h.complaint_id = ? ORDER BY h.id`,
    [complaintId]
  );
  return rows;
};

export const getAllComplaints = async () => {
  const [rows] = await pool.query(
    `SELECT c.id, c.title, c.status, c.priority, c.created_at,
            c.assigned_officer_id,
            cat.name AS category, cat.department_id,
            u.name AS citizen_name,
            o.name AS officer_name
     FROM complaints c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users u ON u.id = c.user_id
     LEFT JOIN users o ON o.id = c.assigned_officer_id
     ORDER BY c.created_at DESC`
  );
  return rows;
};

export const assignComplaint = async ({ complaintId, officerId, officerName, adminId, oldStatus }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'UPDATE complaints SET assigned_officer_id = ?, status = ? WHERE id = ?',
      [officerId, 'Assigned', complaintId]
    );

    await conn.query(
      `INSERT INTO status_history (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, oldStatus, 'Assigned', adminId, `Assigned to ${officerName}`]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getComplaintsByOfficer = async (officerId) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.title, c.status, c.priority, c.address,
            c.latitude, c.longitude, c.created_at, c.updated_at,
            cat.name AS category,
            u.name AS citizen_name,
            (SELECT image_path FROM complaint_images
              WHERE complaint_id = c.id AND type = 'complaint'
              ORDER BY id LIMIT 1) AS thumbnail
     FROM complaints c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users u ON u.id = c.user_id
     WHERE c.assigned_officer_id = ?
     ORDER BY c.updated_at DESC`,
    [officerId]
  );
  return rows;
};

export const updateComplaintStatus = async ({
  complaintId, oldStatus, newStatus, changedBy, remarks, imagePaths,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE complaints SET status = ? WHERE id = ?', [newStatus, complaintId]);

    await conn.query(
      `INSERT INTO status_history (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, oldStatus, newStatus, changedBy, remarks || null]
    );

    for (const imagePath of imagePaths) {
      await conn.query(
        'INSERT INTO complaint_images (complaint_id, image_path, type) VALUES (?, ?, ?)',
        [complaintId, imagePath, 'resolution']
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};