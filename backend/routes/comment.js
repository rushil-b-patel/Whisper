import express from 'express';
import { addComment, deleteComment, voteComment } from '../controllers/comment.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';

const router = express.Router();

router.put('/:id', verifyToken, voteComment);
router.post('/:id', verifyToken, addComment);
router.delete('/:id/:commentId', verifyToken, deleteComment);

export default router;
