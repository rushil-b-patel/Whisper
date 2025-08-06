import express from 'express';
import {
    createPost,
    getAllPosts,
    getUserPosts,
    getPost,
    upVotePost,
    downVotePost,
    deletePost,
    toggleSavePost,
    getSavedPosts,
} from '../controllers/post.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/user-posts', verifyToken, getUserPosts);
router.get('/:id', getPost);
router.put('/save/:id', verifyToken, toggleSavePost);
router.get('/saved-posts', verifyToken, getSavedPosts);

router.post('/create-post', upload.single('image'), verifyToken, createPost);
router.put('/upvote/:id', verifyToken, upVotePost);
router.put('/downvote/:id', verifyToken, downVotePost);
router.delete('/delete-post/:id', verifyToken, deletePost);

export default router;
