import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    userName:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);