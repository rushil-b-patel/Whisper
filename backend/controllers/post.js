import { Post, Comment, Tag } from '../models/post.js';
import { User } from '../models/user.js';
import { sendSuccess, sendError } from '../utils/sendResponse.js';

export const createPost = async (req, res) => {
    try {
        const { title, description, allowComments } = req.body;

        if (!title?.trim()) {
            return sendError(res, 400, 'Title is required');
        }

        const imageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        const allowCommentsBool = allowComments === 'true' || allowComments === true;

        let parsedDescription;
        try {
            parsedDescription = JSON.parse(description);
        } catch {
            return sendError(res, 400, 'Invalid description format');
        }

        let tags = [];
        if (req.body.tags) {
            try {
                tags = JSON.parse(req.body.tags);
            } catch {
                return sendError(res, 400, 'Invalid tags format');
            }
        }
        const tagIds = [];
        for (const tagName of tags) {
            let tag = await Tag.findOne({
                name: new RegExp(`^${tagName}$`, 'i'),
            });
            if (!tag) {
                tag = await Tag.create({ name: tagName.trim() });
            }
            tagIds.push(tag._id);
        }

        const post = new Post({
            title: title.trim(),
            description: parsedDescription,
            user: req.userId,
            image: imageUrl,
            tags: tagIds,
            allowComments: allowCommentsBool,
        });

        await post.save();

        return sendSuccess(res, 201, 'Post created successfully', {
            post,
            postId: post._id,
        });
    } catch (error) {
        return sendError(res, 500, 'Failed to create post', {
            error: error.message,
        });
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'userName department');
        if (!post) return sendError(res, 404, 'Post not found');

        const comments = await Comment.find({ post: req.params.id })
            .populate('user', 'userName')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'Post fetched successfully', { post, comments });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch post', { error: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'userName department')
            .sort({ createdAt: -1 });

        const postsWithCommentCount = await Promise.all(
            posts.map(async post => {
                const count = await Comment.countDocuments({ post: post._id });
                return { ...post.toObject(), commentCount: count };
            })
        );

        return sendSuccess(res, 200, 'All posts fetched', { posts: postsWithCommentCount });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch posts', { error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return sendError(res, 404, 'Post not found');

        if (post.user.toString() !== req.userId)
            return sendError(res, 403, 'Unauthorized to delete this post');

        await post.deleteOne();
        return sendSuccess(res, 200, 'Post deleted successfully');
    } catch (error) {
        return sendError(res, 500, 'Failed to delete post', { error: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.userId })
            .populate('user', 'userName')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'User posts fetched successfully', { posts });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch user posts', { error: error.message });
    }
};

export const upVotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return sendError(res, 404, 'Post not found');

        const userId = req.userId;
        const upIndex = post.upVotedUsers.indexOf(userId);
        const downIndex = post.downVotedUsers.indexOf(userId);

        if (upIndex > -1) {
            post.upVotes--;
            post.upVotedUsers.splice(upIndex, 1);
        } else {
            if (downIndex > -1) {
                post.downVotes--;
                post.downVotedUsers.splice(downIndex, 1);
            }
            post.upVotes++;
            post.upVotedUsers.push(userId);
        }

        await post.save();
        return sendSuccess(res, 200, 'Post upvoted', { post });
    } catch (error) {
        return sendError(res, 500, 'Failed to upvote post', { error: error.message });
    }
};

export const downVotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return sendError(res, 404, 'Post not found');

        const userId = req.userId;
        const downIndex = post.downVotedUsers.indexOf(userId);
        const upIndex = post.upVotedUsers.indexOf(userId);

        if (downIndex > -1) {
            post.downVotes--;
            post.downVotedUsers.splice(downIndex, 1);
        } else {
            if (upIndex > -1) {
                post.upVotes--;
                post.upVotedUsers.splice(upIndex, 1);
            }
            post.downVotes++;
            post.downVotedUsers.push(userId);
        }

        await post.save();
        return sendSuccess(res, 200, 'Post downvoted', { post });
    } catch (error) {
        return sendError(res, 500, 'Failed to downvote post', { error: error.message });
    }
};

export const toggleSavePost = async (req, res) => {
    try {
        const userId = req.userId;
        const postId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return sendError(res, 404, 'User not found');

        const alreadySaved = user.savedPosts.includes(postId);
        if (alreadySaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
            await user.save();
            return sendSuccess(res, 200, 'Post unsaved', { isSaved: false });
        }

        user.savedPosts.push(postId);
        await user.save();
        return sendSuccess(res, 200, 'Post saved', { isSaved: true });
    } catch (error) {
        return sendError(res, 500, 'Failed to toggle save post', { error: error.message });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: 'savedPosts',
            populate: { path: 'user', select: 'userName department' },
        });

        if (!user) return sendError(res, 404, 'User not found');

        return sendSuccess(res, 200, 'Saved posts fetched successfully', {
            savedPosts: user.savedPosts,
        });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch saved posts', { error: error.message });
    }
};

export const getTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
        return sendSuccess(res, 200, 'Tags fetched successfully', { tags });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch tags', { error: error.message });
    }
};

export const saveTag = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) return sendError(res, 400, 'Tag name required');

        let tag = await Tag.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (!tag) {
            tag = await Tag.create({ name: name.trim() });
        }

        return sendSuccess(res, 201, 'Tag saved successfully', { tag });
    } catch (error) {
        return sendError(res, 500, 'Failed to save tag', { error: error.message });
    }
};

export const getPostsByTag = async (req, res) => {
    try {
        const { name } = req.params;
        const tag = await Tag.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (!tag) return sendError(res, 404, 'Tag not found');

        const posts = await Post.find({ tags: tag._id })
            .populate('user', 'userName')
            .populate('tags', 'name')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'Posts by tag fetched', { posts });
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch posts by tag', { error: error.message });
    }
};
