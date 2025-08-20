import { User } from '../models/user.js';
import { Post, Comment } from '../models/post.js';
import { sendSuccess, sendError } from '../utils/sendResponse.js';

export const getUserData = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ userName: username }).select('-password');

        if (!user) return sendError(res, 404, 'User not found');

        return sendSuccess(res, 200, 'User fetched successfully', { user });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch user data', { error: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.params.username });
        if (!user) return sendError(res, 404, 'User not found');

        const posts = await Post.find({ user: user._id })
            .populate('user', 'userName email department')
            .sort({ createdAt: -1 });

        const postsWithComments = await Promise.all(
            posts.map(async post => ({
                ...post.toObject(),
                commentCount: await Comment.countDocuments({ post: post._id }),
            }))
        );

        return sendSuccess(res, 200, 'User posts fetched', { items: postsWithComments });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch user posts', { error: error.message });
    }
};

export const getUserComments = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.params.username });
        if (!user) return sendError(res, 404, 'User not found');

        const comments = await Comment.find({ user: user._id }).sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'User comments fetched', { items: comments });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch user comments', { error: error.message });
    }
};

export const getUserSavedPosts = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.params.username }).populate({
            path: 'savedPosts',
            populate: {
                path: 'user',
                select: 'userName email department',
            },
        });

        if (!user) return sendError(res, 404, 'User not found');

        return sendSuccess(res, 200, 'User saved posts fetched', { items: user.savedPosts });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch saved posts', { error: error.message });
    }
};

export const getUserUpvotedPosts = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.params.username });
        if (!user) return sendError(res, 404, 'User not found');

        const posts = await Post.find({ upVotedUsers: user._id })
            .populate('user', 'userName email department')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'User upvoted posts fetched', { items: posts });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch upvoted posts', { error: error.message });
    }
};

export const getUserDownvotedPosts = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.params.username });
        if (!user) return sendError(res, 404, 'User not found');

        const posts = await Post.find({ downVotedUsers: user._id })
            .populate('user', 'userName email department')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'User downvoted posts fetched', { items: posts });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch downvoted posts', { error: error.message });
    }
};
