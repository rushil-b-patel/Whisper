import { User } from '../models/user.js';
import { Post, Comment } from '../models/post.js';

export const getUserData = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ userName: username }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

export const getUserPosts = async (req, res) => {
  const user = await User.findOne({ userName: req.params.username });
  const posts = await Post.find({ user: user._id })
    .populate('user', 'userName email department')
    .sort({ createdAt: -1 });
  res.json({ items: posts });
};

export const getUserComments = async (req, res) => {
  const user = await User.findOne({ userName: req.params.username });
  const comments = await Comment.find({ user: user._id }).sort({ createdAt: -1 });
  res.json({ items: comments });
};

export const getUserSavedPosts = async (req, res) => {
  const user = await User.findOne({ userName: req.params.username }).populate({
    path: 'savedPosts',
    populate: {
      path: 'user',
      select: 'userName email department',
    },
  });
  res.json({ items: user.savedPosts });
};

export const getUserUpvotedPosts = async (req, res) => {
  const user = await User.findOne({ userName: req.params.username });
  const posts = await Post.find({ upVotedUsers: user._id })
    .populate('user', 'userName email department')
    .sort({ createdAt: -1 });
  res.json({ items: posts });
};

export const getUserDownvotedPosts = async (req, res) => {
  const user = await User.findOne({ userName: req.params.username });
  const posts = await Post.find({ downVotedUsers: user._id })
    .populate('user', 'userName email department')
    .sort({ createdAt: -1 });
  res.json({ items: posts });
};
