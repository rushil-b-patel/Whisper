import express from 'express';
import { getUserStats } from '../controllers/stats.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';

const router = express.Router();

router.get('/user-stats', verifyToken, getUserStats);

export default router;
