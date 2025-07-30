import { Post } from '../models/post.js';
import { User } from '../models/user.js';

export const createPost = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

        let parsedDescription;
        try {
            parsedDescription = JSON.parse(description);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid description format" });
        }

        const postData = {
            title,
            description: parsedDescription,
            user: req.userId,
            image: imageUrl,
            category,
        };

        const post = new Post(postData);
        await post.save();
        res.status(201).json({ success: true, post, postId: post._id });
    } catch(error){
        res.status(500).json({success: false, message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'userName department').sort({ createdAt: -1 });
        res.status(200).json({success: true, posts});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.userId }).populate('user', 'username').sort({ createdAt: -1 });
        res.status(200).json({success: true, posts});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

export const upVotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        const upVoteIndex = post.upVotedUsers.indexOf(req.user.id);
        if(upVoteIndex > -1){
            post.upVotes -= 1;
            post.upVotedUsers.splice(upVoteIndex, 1);
        }
        else{
            const downVoteIndex = post.downVotedUsers.indexOf(req.user.id);
            if(downVoteIndex > -1){
                post.downVotes -= 1;
                post.downVotedUsers.splice(downVoteIndex, 1);
            }
            post.upVotes += 1;
            post.upVotedUsers.push(req.user.id);
        }
        await post.save();
        res.status(200).json({success: true, post});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

export const downVotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        const downVoteIndex = post.downVotedUsers.indexOf(req.user.id);
        if(downVoteIndex > -1){
            post.downVotes -= 1;
            post.downVotedUsers.splice(downVoteIndex, 1);
        }
        else{
            const upVoteIndex = post.upVotedUsers.indexOf(req.user.id);
            if(upVoteIndex > -1){
                post.upVotes -= 1;
                post.upVotedUsers.splice(upVoteIndex, 1);
            }
            post.downVotes += 1;
            post.downVotedUsers.push(req.user.id);
        }
        await post.save();
        res.status(200).json({success: true, post});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

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

export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'userName department').populate('comments.User' , 'userName');
        if(!post){
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        res.status(200).json({success: true, post});
    }
    catch(error){
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


export const deletePost = async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({success: false, message: 'Post not found'})
        }
        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
        }

        await Post.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    }
    catch(error){
        res.status(500).json({ success: false, message: error.message });
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

export const toggleSavePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const alreadySaved = user.savedPosts.includes(postId);

        if (alreadySaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
            await user.save();
            return res.status(200).json({ success: true, message: 'Post unsaved', isSaved: false });
        } else {
            user.savedPosts.push(postId);
            await user.save();
            return res.status(200).json({ success: true, message: 'Post saved', isSaved: true });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', error });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedPosts',
            populate: {
                path: 'user',
                select: 'userName department'
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ success: true, savedPosts: user.savedPosts });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch saved posts', error });
    }
};
