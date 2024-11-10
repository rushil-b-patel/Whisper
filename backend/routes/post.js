import express from 'express';
import { createPost, getAllPosts, getUserPosts, getPost, updatePost, upVotePost, downVotePost, addComment } from '../controllers/post.js';
import { verifyToken } from '../middlewares/postVerifyToken.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.post('/create-post', upload.single('image'), verifyToken, createPost);
router.get('/', getAllPosts);   
router.get('/user', verifyToken, getUserPosts);
router.get('/:id', getPost);

router.put('/update/:id', verifyToken, updatePost);
router.put('/upvote/:id', verifyToken, upVotePost);
router.put('/downvote/:id', verifyToken, downVotePost);

router.post('/add-comment/:id', verifyToken, addComment);

export default router;