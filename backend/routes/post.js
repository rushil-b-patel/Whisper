import express from 'express';
import { createPost, getAllPosts, getUserPosts, getPost, upVotePost, downVotePost, addComment, deleteComment } from '../controllers/post.js';
import { verifyToken } from '../middlewares/postVerifyToken.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.get('/', getAllPosts);   
router.get('/:id', getPost);
router.get('/user', verifyToken, getUserPosts);

router.post('/create-post', upload.single('image'), verifyToken, createPost);
router.put('/upvote/:id', verifyToken, upVotePost);
router.put('/downvote/:id', verifyToken, downVotePost);
router.post('/add-comment/:id', verifyToken, addComment);
router.delete('/delete-comment/:id/:commentId', verifyToken, deleteComment);

export default router;