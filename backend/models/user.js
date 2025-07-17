import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    userName:{
        type: String,
        required: true,
        unique: true
    },
    emailHash: { type: String, required: true, unique: true },
    password:{
        type: String,
        required: function(){
            return !this.googleId && !this.githubId;
        }
    },
    googleId:{
        type: String,
        unique: true,
        sparse: true
    },
    githubId:{
        type: String,
        unique: true,
        sparse: true
    },
    department:{
        type: String,
    },
    bio:{
        type: String,
    },
    profilePicture:{
        type: String,
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }],
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);