import { Router } from 'express';
import { listAssignedComplaints, updateStatus } from '../controllers/officerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect, authorizeRoles('officer'));

router.get('/complaints', listAssignedComplaints);
router.patch('/complaints/:id/status', upload.array('images', 3), updateStatus);

export default router;