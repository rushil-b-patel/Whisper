import express from 'express';
import { createPost, getAllPosts, getUserPosts, getPost, upVotePost,
    downVotePost, addComment, deleteComment, deletePost,
    voteComment, savePostToUser, getSavedPosts} from '../controllers/post.js';
import { verifyToken } from '../middlewares/postVerifyToken.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/user-posts', verifyToken, getUserPosts);
router.get('/:id', getPost);
router.put('/vote-comment/:id', verifyToken, voteComment);
router.put('/save/:id', verifyToken, savePostToUser);
router.get('/saved-posts', verifyToken, getSavedPosts);

router.post('/create-post', upload.single('image'), verifyToken, createPost);
router.put('/upvote/:id', verifyToken, upVotePost);
router.put('/downvote/:id', verifyToken, downVotePost);
router.post('/add-comment/:id', verifyToken, addComment);
router.delete('/delete-post/:id', verifyToken, deletePost);
router.delete('/delete-comment/:id/:commentId', verifyToken, deleteComment);

export default router;