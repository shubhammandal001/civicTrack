import { Router } from 'express';
import { createComplaint,listMyComplaints,getComplaintDetail } from '../controllers/complaintController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/', protect, authorizeRoles('citizen'), upload.array('images', 3), createComplaint);
router.get('/my', protect, authorizeRoles('citizen'), listMyComplaints);
router.get('/:id', protect, getComplaintDetail);

export default router;