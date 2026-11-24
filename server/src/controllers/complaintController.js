import fs from 'fs';
import { createComplaintWithImages ,getComplaintsByUser,getComplaintById,getImagesByComplaint,getStatusHistory} from '../models/complaintModel.js';
import { findCategoryById } from '../models/categoryModel.js';

// Validation fail ho to upload ho chuki photos delete kar do
const removeFiles = (files = []) => {
  files.forEach((f) => fs.unlink(f.path, () => {}));
};

export const createComplaint = async (req, res) => {
  const files = req.files || [];
  try {
    const { title, description, category_id, latitude, longitude, address } = req.body;

    if (!title || !description || !category_id || !latitude || !longitude) {
      removeFiles(files);
      return res.status(400).json({ message: 'Title, description, category and location are required' });
    }
    if (title.trim().length > 200) {
      removeFiles(files);
      return res.status(400).json({ message: 'Title must be 200 characters or less' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      removeFiles(files);
      return res.status(400).json({ message: 'Invalid location' });
    }

    const category = await findCategoryById(category_id);
    if (!category) {
      removeFiles(files);
      return res.status(400).json({ message: 'Invalid category' });
    }

    const imagePaths = files.map((f) => `uploads/${f.filename}`);

    const complaintId = await createComplaintWithImages({
      userId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      categoryId: category.id,
      latitude: lat,
      longitude: lng,
      address,
      imagePaths,
    });

    res.status(201).json({ message: 'Complaint submitted', complaintId });
  } catch (err) {
    removeFiles(files);
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const listMyComplaints = async (req, res) => {
  try {
    const complaints = await getComplaintsByUser(req.user.id);
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getComplaintDetail = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid complaint id' });
    }

    const complaint = await getComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { role, id: userId } = req.user;
    const allowed =
      role === 'admin' ||
      (role === 'citizen' && complaint.user_id === userId) ||
      (role === 'officer' && complaint.assigned_officer_id === userId);

    if (!allowed) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const [images, history] = await Promise.all([
      getImagesByComplaint(id),
      getStatusHistory(id),
    ]);

    res.json({ complaint, images, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};