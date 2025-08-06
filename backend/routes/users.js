import express from 'express';
import {
    getUserData,
    getUserPosts,
    getUserComments,
    getUserSavedPosts,
    getUserUpvotedPosts,
    getUserDownvotedPosts,
} from '../controllers/users.js';

const router = express.Router();

router.get('/:username', getUserData);
router.get('/:username/posts', getUserPosts);
router.get('/:username/comments', getUserComments);
router.get('/:username/saved', getUserSavedPosts);
router.get('/:username/upvoted', getUserUpvotedPosts);
router.get('/:username/downvoted', getUserDownvotedPosts);

export default router;
