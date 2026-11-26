import { Router } from 'express';
import { listAllComplaints, listOfficers, assignToOfficer } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorizeRoles('admin'));

router.get('/complaints', listAllComplaints);
router.get('/officers', listOfficers);
router.patch('/complaints/:id/assign', assignToOfficer);

export default router;