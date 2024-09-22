import express from 'express';
import { createPost, getAllPosts, getUserPosts, getPost, updatePost, upVotePost, downVotePost, addComment } from '../controllers/post.js';
import { verifyToken } from '../middlewares/postVerifyToken.js';

const router = express.Router();

router.post('/create', verifyToken, createPost);
router.get('/', getAllPosts);   
router.get('/user', verifyToken, getUserPosts);
router.get('/:id', getPost);
router.put('/update/:id', verifyToken, updatePost);
router.put('/upvote/:id', verifyToken, upVotePost);
router.put('/downvote/:id', verifyToken, downVotePost);
router.post('/add-comment/:id', verifyToken, addComment);

export default router;