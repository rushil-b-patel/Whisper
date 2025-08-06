import { Post, Comment } from '../models/post.js';

export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.allowComments) {
            return res.status(403).json({ message: 'Commenting is disabled for this post' });
        }

        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Content is required' });

        const comment = new Comment({
            text,
            user: req.userId,
            post: req.params.id,
        });

        await comment.save();
        const populatedComment = await Comment.findById(comment._id).populate('user', 'userName');

        res.status(201).json({ success: true, comment: populatedComment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.user.toString() !== req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await comment.deleteOne();
        res.status(200).json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const voteComment = async (req, res) => {
    try {
        const { commentId, voteType } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

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
        res.status(200).json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
