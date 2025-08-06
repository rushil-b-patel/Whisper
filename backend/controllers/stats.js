import { Post } from '../models/post.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';

export const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).select('createdAt');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const postsCount = await Post.countDocuments({ user: userId });

        const upvotesResult = await Post.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, totalUpvotes: { $sum: '$upVotes' } } },
        ]);
        const totalUpvotes = upvotesResult[0]?.totalUpvotes || 0;

        const commentsCount = await Post.aggregate([
            { $unwind: '$comments' },
            { $match: { 'comments.user': new mongoose.Types.ObjectId(userId) } },
            { $count: 'totalComments' },
        ]);
        const totalComments = commentsCount[0]?.totalComments || 0;

        const karma = totalUpvotes + totalComments * 2;

        const recentPosts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(2)
            .select('title createdAt');

        const recentComments = await Post.aggregate([
            { $unwind: '$comments' },
            { $match: { 'comments.user': new mongoose.Types.ObjectId(userId) } },
            { $sort: { 'comments.createdAt': -1 } },
            { $limit: 2 },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'postInfo',
                },
            },
            {
                $project: {
                    title: { $arrayElemAt: ['$postInfo.title', 0] },
                    createdAt: '$comments.createdAt',
                    type: 'comment',
                },
            },
        ]);

        const recentActivity = [
            ...recentPosts.map(post => ({
                title: `Posted: ${post.title.substring(0, 30)}...`,
                time: getTimeAgo(post.createdAt),
                type: 'post',
            })),
            ...recentComments.map(comment => ({
                title: `Commented on: ${comment.title?.substring(0, 30)}...`,
                time: getTimeAgo(comment.createdAt),
                type: 'comment',
            })),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        const stats = {
            posts: postsCount,
            upvotes: totalUpvotes,
            comments: totalComments,
            karma,
            joinDate: formatJoinDate(user.createdAt),
            recentActivity,
        };

        res.status(200).json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stats',
        });
    }
};

const getTimeAgo = date => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
};

const formatJoinDate = date => {
    const joinDate = new Date(date);
    const month = joinDate.toLocaleString('default', { month: 'short' });
    const year = joinDate.getFullYear();
    return `${month} ${year}`;
};
