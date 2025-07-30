import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },
    upVotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', }],
    downVotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', }],
    createdAt: { type: Date, default: Date.now }
}, {timestamps: true});

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: Object,
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

export const Post = mongoose.model('Post', postSchema);