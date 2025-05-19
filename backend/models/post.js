import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

// Poll option schema
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

// Poll schema
const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [pollOptionSchema],
    endDate: {
        type: Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000) // Default 7 days from now
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