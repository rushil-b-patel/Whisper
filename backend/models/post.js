import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    upVotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downVotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const pollOptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [pollOptionSchema],
    endDate: {
        type: Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000)
    }
});

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    upVotes: {
        type: Number,
        default: 0
    },
    downVotes: {
        type: Number,
        default: 0
    },
    upVotedUsers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downVotedUsers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    category: {
        type: String,
        required: true
    },
    comments: [commentSchema],
    poll: {
        type: pollSchema,
        required: false
    },
    isDraft: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

export const Post = mongoose.model('Post', postSchema);
export const Comment = mongoose.model('Comment', commentSchema);