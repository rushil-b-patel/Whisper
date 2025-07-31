import { Post } from '../models/post.js';

export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        const { text } = req.body;
        if(!text) {
            return res.status(400).json({success: false, message: 'Content is required'});
        }
        const comment = { text, User: req.userId, createdAt: new Date() };
        post.comments.push(comment);
        await post.save();

        const populatedPost = await Post.findById(post._id).populate('comments.User', 'userName');
        const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.status(200).json({success: true, comment: addedComment});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

export const deleteComment = async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        const comment = post.comments.find((comment) => comment._id.toString() === req.params.commentId);
        if(!comment){
            return res.status(404).json({success: false, message: 'Comment not found'});
        }
        if(comment.User.toString() !== req.userId){
            return res.status(401).json({success: false, message: 'Unauthorized'});
        }
        await Post.updateOne(
            { _id: req.params.id },
            { $pull: { comments: { _id: req.params.commentId } } }
          );
        res.status(200).json({success: true, post});
    }
    catch(error){
        res.status(500).json({success: false, message: error.message });
    }
}

export const voteComment = async (req, res) => {
    try {
        const { commentId, voteType } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

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

        await post.save();
        res.status(200).json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
