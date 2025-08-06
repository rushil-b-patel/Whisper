import { Post, Comment } from '../models/post.js';
import { sendSuccess, sendError } from '../utils/sendResponse.js';

export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return sendError(res, 404, 'Post not found');

        if (!post.allowComments) {
            return sendError(res, 403, 'Commenting is disabled for this post');
        }

        const { text } = req.body;
        if (!text) return sendError(res, 400, 'Content is required');

        const comment = new Comment({
            text,
            user: req.userId,
            post: req.params.id,
        });

        await comment.save();
        const populatedComment = await Comment.findById(comment._id).populate('user', 'userName');

        return sendSuccess(res, 201, 'Comment added successfully', { comment: populatedComment });
    } catch (error) {
        return sendError(res, 500, 'Failed to add comment', { error: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return sendError(res, 404, 'Comment not found');

        if (comment.user.toString() !== req.userId) {
            return sendError(res, 401, 'Unauthorized');
        }

        await comment.deleteOne();
        return sendSuccess(res, 200, 'Comment deleted successfully');
    } catch (error) {
        return sendError(res, 500, 'Failed to delete comment', { error: error.message });
    }
};

export const voteComment = async (req, res) => {
    try {
        const { commentId, voteType } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) return sendError(res, 404, 'Comment not found');

        const userId = req.userId;
        const removeFromArray = (arr, val) => {
            const index = arr.indexOf(val);
            if (index !== -1) arr.splice(index, 1);
        };

        if (voteType === 'up') {
            if (comment.upVotedUsers.includes(userId)) {
                comment.upVotes -= 1;
                removeFromArray(comment.upVotedUsers, userId);
            } else {
                if (comment.downVotedUsers.includes(userId)) {
                    comment.downVotes -= 1;
                    removeFromArray(comment.downVotedUsers, userId);
                }
                comment.upVotes += 1;
                comment.upVotedUsers.push(userId);
            }
        } else if (voteType === 'down') {
            if (comment.downVotedUsers.includes(userId)) {
                comment.downVotes -= 1;
                removeFromArray(comment.downVotedUsers, userId);
            } else {
                if (comment.upVotedUsers.includes(userId)) {
                    comment.upVotes -= 1;
                    removeFromArray(comment.upVotedUsers, userId);
                }
                comment.downVotes += 1;
                comment.downVotedUsers.push(userId);
            }
        }

        await comment.save();
        return sendSuccess(res, 200, 'Comment vote updated', { comment });
    } catch (error) {
        return sendError(res, 500, 'Failed to vote on comment', { error: error.message });
    }
};
