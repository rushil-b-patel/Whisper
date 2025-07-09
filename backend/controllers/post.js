import { Post } from '../models/post.js';

export const createPost = async (req, res) => {
    try {
        const { title, description, category, isDraft, poll } = req.body;
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

        const postData = {
            title,
            description,
            user: req.userId,
            image: imageUrl,
            category,
            isDraft: isDraft === 'true'
        };

        if (poll) {
            try {
                const pollData = JSON.parse(poll);
                if (pollData.question && pollData.options && pollData.options.length >= 2) {
                    postData.poll = {
                        question: pollData.question,
                        options: pollData.options.map(option => ({
                            text: option,
                            votes: 0,
                            voters: []
                        }))
                    };
                }
            } catch (error) {
                console.error('Error parsing poll data:', error);
            }
        }

        const post = new Post(postData);
        await post.save();
        res.status(201).json({success: true, post});
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

export const getDrafts = async (req, res) => {
    try {
        const drafts = await Post.find({
            user: req.userId,
            isDraft: true
        }).populate('user', 'userName department').sort({ updatedAt: -1 });

        res.status(200).json({success: true, drafts});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}
