import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
} from '../nodeMailer/email.js';
import { User } from '../models/user.js';
import { computeEmailHash, generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { CLIENT_URI } from '../utils/envVariables.js';
import { sendSuccess, sendError } from '../utils/sendResponse.js';

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return sendError(res, 400, 'Please fill in all fields');
        }

        let user =
            (await User.findOne({ userName: email })) ||
            (await User.findOne({ emailHash: computeEmailHash(email) }));

        if (!user) {
            return sendError(res, 404, "User doesn't exist with the provided credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return sendError(res, 401, 'Invalid password');
        }

        if (!user.isVerified) {
            return sendError(res, 403, 'Email not verified. Please verify your email', {
                redirect: true,
            });
        }

        const token = generateTokenAndSetCookie(res, user._id);

        return sendSuccess(res, 200, 'Logged in successfully', {
            token,
            user: { ...user._doc, password: null },
        });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during login');
    }
};

export const signup = async (req, res) => {
    const { userName, email, password } = req.body;
    try {
        if (!userName || !email || !password) {
            return sendError(res, 400, 'Please fill in all fields');
        }

        if (await User.findOne({ userName })) {
            return sendError(res, 409, 'Username already exists');
        }

        const emailHash = computeEmailHash(email);
        if (await User.findOne({ emailHash })) {
            return sendError(res, 409, 'Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            userName,
            emailHash,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: Date.now() + 3600000,
        });

        await user.save();
        const token = generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(email, verificationToken);

        return sendSuccess(res, 201, 'User created successfully', {
            token,
            user: {
                ...user._doc,
                password: null,
                email: undefined,
            },
        });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during signup');
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user)
            return sendError(res, 400, 'Invalid or expired code. Please try again...', {
                redirect: false,
            });

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        return sendSuccess(res, 200, 'Email verified successfully', {
            user: { ...user._doc, password: null },
            redirect: true,
        });
    } catch (err) {
        return sendError(res);
    }
};

export const logout = async (req, res) => {
    res.clearCookie('token');
    return sendSuccess(res, 200, 'Logged out successfully');
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return sendError(res, 400, 'User not found');

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendPasswordResetEmail(user.email, `${CLIENT_URI}/reset-password/${resetToken}`);
        return sendSuccess(res, 200, 'Password reset email sent');
    } catch (err) {
        return sendError(res);
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: Date.now() },
        });

        if (!user) return sendError(res, 400, 'Invalid or expired token');

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;

        await user.save();
        await sendResetSuccessEmail(user.email);

        return sendSuccess(res, 200, 'Password reset successfully');
    } catch (err) {
        return sendError(res);
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return sendError(res, 400, 'User not found');

        const { _id, userName, email, bio, department, savedPosts, isVerified } = user;

        return sendSuccess(res, 200, 'Authenticated', {
            user: {
                _id,
                userName,
                email,
                bio,
                department,
                savedPosts,
                isVerified,
                password: null,
            },
        });
    } catch (err) {
        return sendError(res);
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return sendError(res, 400, 'User not found');

        const { userName, department, bio } = req.body;
        user.userName = userName;
        user.department = department;
        user.bio = bio;

        await user.save();
        return sendSuccess(res, 200, 'User updated successfully', {
            user: { ...user._doc, password: null },
        });
    } catch (err) {
        return sendError(res);
    }
};

export const googleLogin = async (req, res) => {
    const { googleToken } = req.body;
    try {
        const userData = await verifyGoogleToken(googleToken);
        let user =
            (await User.findOne({ email: userData.email })) ||
            (await User.findOne({ emailHash: computeEmailHash(userData.email) }));

        if (!user) return sendError(res, 400, 'User not found. Please sign up');

        const token = generateTokenAndSetCookie(res, user._id);
        await user.save();

        return sendSuccess(res, 200, 'Google login success', { token, user });
    } catch (err) {
        return sendError(res);
    }
};

export const googleSignup = async (req, res) => {
    const { googleToken } = req.body;
    try {
        const userData = await verifyGoogleToken(googleToken);
        let user = await User.findOne({ email: userData.email });

        if (user) return sendError(res, 400, 'User already exists. Please log in.');

        const emailHash = computeEmailHash(userData.email);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        user = new User({
            userName: userData.name,
            emailHash,
            googleId: userData.sub,
            verificationToken,
            verificationTokenExpires: Date.now() + 1 * 60 * 60 * 1000,
        });

        await user.save();
        const token = generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(userData.email, verificationToken);

        return sendSuccess(res, 200, 'User created successfully', { token, user });
    } catch (err) {
        return sendError(res);
    }
};
