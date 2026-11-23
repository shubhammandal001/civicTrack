import { Router } from 'express';
import { register,login,getMe} from '../controllers/authController.js';
import { protect,authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

//temporary
router.get('/admin-test', protect, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

export default router;