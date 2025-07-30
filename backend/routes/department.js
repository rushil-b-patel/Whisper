import express from 'express';
import { getDepartments, addDepartment } from '../controllers/department.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';

const router = express.Router();

router.get('/', getDepartments);
router.post('/add', verifyToken, addDepartment);

export default router;
