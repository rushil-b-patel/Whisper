import express from 'express';
import { getPostsByTag, getTags, saveTag } from '../controllers/post.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';

const router = express.Router();

router.get('/', getTags);
router.post('/add', verifyToken, saveTag);
router.get('/:name', getPostsByTag);

export default router;
