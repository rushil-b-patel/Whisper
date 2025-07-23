import { prisma } from "../db/prismaClient.js";

export const createPost = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        const parsedDescription = typeof description === 'string'
            ? JSON.parse(description)
            : description;

        const imageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        const post = await prisma.post.create({
            data: {
                title,
                description: parsedDescription,
                image: imageUrl,
                category,
                userId: req.userId,
            },
        });

        res.status(201).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { userName: true, department: true },
                },
            },
        });

        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { userId: req.userId },
            include: {
                user: {
                    select: { userName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const upVotePost = async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { upVotedUsers: true, downVotedUsers: true },
        });

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const hasUpvoted = post.upVotedUsers.some((user) => user.id === userId);
        const hasDownvoted = post.downVotedUsers.some((user) => user.id === userId);

        if (hasUpvoted) {
            await prisma.post.update({
                where: { id: postId },
                data: {
                    upVotedUsers: { disconnect: { id: userId } },
                    upVotes: { decrement: 1 },
                },
            });
        } else {
            const updates = {
                upVotedUsers: { connect: { id: userId } },
                upVotes: { increment: 1 },
            };
            if (hasDownvoted) {
                updates.downVotedUsers = { disconnect: { id: userId } };
                updates.downVotes = { decrement: 1 };
            }
            await prisma.post.update({ where: { id: postId }, data: updates });
        }

        const updated = await prisma.post.findUnique({ where: { id: postId } });
        res.status(200).json({ success: true, post: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const downVotePost = async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.userId;
    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { upVotedUsers: true, downVotedUsers: true },
        });

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const hasUpvoted = post.upVotedUsers.some((user) => user.id === userId);
        const hasDownvoted = post.downVotedUsers.some((user) => user.id === userId);

        if (hasDownvoted) {
            await prisma.post.update({
                where: { id: postId },
                data: {
                    downVotedUsers: { disconnect: { id: userId } },
                    downVotes: { decrement: 1 },
                },
            });
        } else {
            const updates = {
                downVotedUsers: { connect: { id: userId } },
                downVotes: { increment: 1 },
            };
            if (hasUpvoted) {
                updates.upVotedUsers = { disconnect: { id: userId } };
                updates.upVotes = { decrement: 1 };
            }
            await prisma.post.update({ where: { id: postId }, data: updates });
        }

        const updated = await prisma.post.findUnique({ where: { id: postId } });
        res.status(200).json({ success: true, post: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: {
                    select: { userName: true, department: true },
                },
                comments: {
                    include: {
                        user: {
                            select: { userName: true },
                        },
                    },
                },
                upVotedUsers: {
                    select: { id: true },
                },
                downVotedUsers: {
                    select: { id: true },
                },
            },
        });

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await prisma.post.findUnique({ where: { id: req.params.id } });

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        if (post.userId !== req.userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

        await prisma.post.delete({ where: { id: req.params.id } });

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const savePostToUser = async (req, res) => {
    const userId = req.userId;
    const postId = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { savedPosts: true },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const alreadySaved = user.savedPosts.some((post) => post.id === postId);
        if (alreadySaved) return res.status(400).json({ message: 'Post already saved' });

        await prisma.user.update({
            where: { id: userId },
            data: {
                savedPosts: { connect: { id: postId } },
            },
        });

        return res.status(200).json({ success: true, message: 'Post saved successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to save post', error });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                savedPosts: {
                    include: {
                        user: {
                            select: { userName: true, department: true },
                        },
                    },
                },
            },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ success: true, savedPosts: user.savedPosts });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch saved posts', error });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                postId,
                userId: req.userId,
            },
            include: {
                user: {
                    select: { userName: true },
                },
            },
        });

        res.status(200).json({ success: true, comment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id: postId, commentId } = req.params;

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.userId !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await prisma.comment.delete({ where: { id: commentId } });

        res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const voteComment = async (req, res) => {
    try {
        const { commentId, voteType } = req.body;
        const userId = req.userId;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                upVotedUsers: true,
                downVotedUsers: true,
            },
        });

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        const hasUpvoted = comment.upVotedUsers.some(user => user.id === userId);
        const hasDownvoted = comment.downVotedUsers.some(user => user.id === userId);

        if (voteType === 'up') {
            const updateData = {
                upVotedUsers: hasUpvoted
                    ? { disconnect: { id: userId } }
                    : { connect: { id: userId } },
                downVotedUsers: hasDownvoted ? { disconnect: { id: userId } } : undefined,
                upVotes: hasUpvoted ? { decrement: 1 } : { increment: 1 },
                downVotes: hasDownvoted ? { decrement: 1 } : undefined,
            };

            await prisma.comment.update({ where: { id: commentId }, data: updateData });
        } else if (voteType === 'down') {
            const updateData = {
                downVotedUsers: hasDownvoted
                    ? { disconnect: { id: userId } }
                    : { connect: { id: userId } },
                upVotedUsers: hasUpvoted ? { disconnect: { id: userId } } : undefined,
                downVotes: hasDownvoted ? { decrement: 1 } : { increment: 1 },
                upVotes: hasUpvoted ? { decrement: 1 } : undefined,
            };

            await prisma.comment.update({ where: { id: commentId }, data: updateData });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid vote type' });
        }

        const updatedComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                user: { select: { userName: true } },
                upVotedUsers: true,
                downVotedUsers: true,
            },
        });

        res.status(200).json({ success: true, comment: updatedComment });
    } catch (error) {
        console.error('Error voting comment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
