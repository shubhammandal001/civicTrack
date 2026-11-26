import { getAllComplaints, getComplaintById, assignComplaint } from '../models/complaintModel.js';
import { getOfficers, findOfficerById } from '../models/userModel.js';

export const listAllComplaints = async (req, res) => {
  try {
    const complaints = await getAllComplaints();
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listOfficers = async (req, res) => {
  try {
    const officers = await getOfficers();
    res.json({ officers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignToOfficer = async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const officerId = Number(req.body.officer_id);

    if (!Number.isInteger(complaintId) || complaintId < 1 || !Number.isInteger(officerId) || officerId < 1) {
      return res.status(400).json({ message: 'Valid complaint id and officer_id are required' });
    }

    const complaint = await getComplaintById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    if (complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'Resolved complaints cannot be reassigned' });
    }

    const officer = await findOfficerById(officerId);
    if (!officer) {
      return res.status(400).json({ message: 'Officer not found' });
    }

    await assignComplaint({
      complaintId,
      officerId,
      officerName: officer.name,
      adminId: req.user.id,
      oldStatus: complaint.status,
    });

    res.json({ message: 'Complaint assigned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};