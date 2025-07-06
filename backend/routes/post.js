import express from 'express';
import { createPost, getAllPosts, getUserPosts, getPost, upVotePost, downVotePost, addComment, deleteComment, getDrafts, getComments } from '../controllers/post.js';
import { verifyToken } from '../middlewares/postVerifyToken.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/user-posts', verifyToken, getUserPosts);
router.get('/drafts', verifyToken, getDrafts);
router.get('/:id', getPost);
router.get("/replies/:parentId", verifyToken, getComments);
router.post('/create-post', upload.single('image'), verifyToken, createPost);
router.put('/upvote/:id', verifyToken, upVotePost);
router.put('/downvote/:id', verifyToken, downVotePost);
router.post('/add-comment/:id', verifyToken, addComment);
router.delete('/delete-comment/:id/:commentId', verifyToken, deleteComment);

export default router;