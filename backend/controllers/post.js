import { Post } from '../models/post.js';

export const createPost = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
        const post = new Post({ title, description, user: req.userId, image: imageUrl, category });
        await post.save();
        res.status(201).json({sucess: true, post});
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
        res.status(200).json({success: true, comment});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}

export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'userName department');
        if(!post){
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        res.status(200).json({success: true, post});
    } 
    catch(error){
        res.status(500).json({success: false, message: error.message });
    }
}

export const updatePost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        post.title = title; 
        post.description = description;
        await post.save();
        res.status(200).json({success: true, post});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
}