import express from 'express';
import { getDepartments, getUserStats } from '../controllers/stats.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';

const router = express.Router();

router.get('/departments', getDepartments);
router.get('/user-stats', verifyToken, getUserStats);

export default router;
