import fs from 'fs';
import {
  getComplaintsByOfficer,
  getComplaintById,
  updateComplaintStatus,
} from '../models/complaintModel.js';

// Officer sirf ek step aage badh sakta hai
const NEXT_STATUS = {
  Assigned: 'In Progress',
  'In Progress': 'Resolved',
};

const removeFiles = (files = []) => {
  files.forEach((f) => fs.unlink(f.path, () => {}));
};

export const listAssignedComplaints = async (req, res) => {
  try {
    const complaints = await getComplaintsByOfficer(req.user.id);
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req, res) => {
  const files = req.files || [];
  try {
    const complaintId = Number(req.params.id);
    const { status, remarks } = req.body;

    if (!Number.isInteger(complaintId) || complaintId < 1 || !status) {
      removeFiles(files);
      return res.status(400).json({ message: 'Valid complaint id and status are required' });
    }

    const complaint = await getComplaintById(complaintId);
    if (!complaint || complaint.assigned_officer_id !== req.user.id) {
      removeFiles(files);
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (NEXT_STATUS[complaint.status] !== status) {
      removeFiles(files);
      return res.status(400).json({
        message: `Cannot change status from ${complaint.status} to ${status}`,
      });
    }

    await updateComplaintStatus({
      complaintId,
      oldStatus: complaint.status,
      newStatus: status,
      changedBy: req.user.id,
      remarks: remarks ? remarks.trim() : null,
      imagePaths: files.map((f) => `uploads/${f.filename}`),
    });

    res.json({ message: 'Status updated' });
  } catch (err) {
    removeFiles(files);
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};