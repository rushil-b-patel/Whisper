import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail } from '../nodeMailer/email.js';
import { computeEmailHash, generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { CLIENT_URI } from '../utils/envVariables.js';
import { prisma } from "../db/prismaClient.js";

export const signup = async (req, res) => {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const emailHash = computeEmailHash(email);

        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { userName },
                    { emailHash }
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await prisma.user.create({
            data: {
                userName,
                emailHash,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpires: new Date(Date.now() + 1 * 60 * 60 * 1000),
            }
        });

        const token = generateTokenAndSetCookie(res, user.id);
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                ...user,
                password: null,
                email: undefined,
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { userName: email },
                    { emailHash: computeEmailHash(email) }
                ]
            }
        });

        if (!user) return res.status(400).json({ message: 'User does not exist' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid password' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email', redirect: true });
        }

        const token = generateTokenAndSetCookie(res, user.id);
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                ...user,
                password: null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: code,
                verificationTokenExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code', redirect: false });
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpires: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                ...updated,
                password: null
            },
            redirect: true
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const emailHash = computeEmailHash(email);

        const user = await prisma.user.findFirst({
            where: { emailHash }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordTokenExpires: resetTokenExpires
            }
        });

        await sendPasswordResetEmail(email, `${CLIENT_URI}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error during forgot password:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordTokenExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpires: null
            }
        });

        await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error during reset password:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { savedPosts: true },
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const { id, userName, bio, department, savedPosts, isVerified } = user;

        res.status(200).json({
            success: true,
            user: {
                _id: id,
                userName,
                bio,
                department,
                savedPosts,
                isVerified,
                password: null,
            },
        });
    } catch (error) {
        console.error('Error checking auth', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateUser = async (req, res) => {
    const { userName, department, bio } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: { userName, department, bio },
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                ...updatedUser,
                password: null,
            },
        });
    } catch (error) {
        console.error('Error updating user', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const googleLogin = async (req, res) => {
    const { googleToken } = req.body;

    try {
        const userData = await verifyGoogleToken(googleToken);

        const emailHash = computeEmailHash(userData.email);
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { emailHash },
                    { googleId: userData.sub },
                ],
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found. Please sign up' });
        }

        const token = generateTokenAndSetCookie(res, user.id);

        return res.status(200).json({ message: 'Google login success', token, user });
    } catch (error) {
        console.error('Error logging in with Google', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const googleSignup = async (req, res) => {
    const { googleToken } = req.body;

    try {
        const userData = await verifyGoogleToken(googleToken);
        const emailHash = computeEmailHash(userData.email);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { emailHash },
                    { googleId: userData.sub },
                ],
            },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists. Please log in.' });
        }

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = await prisma.user.create({
            data: {
                userName: userData.name,
                emailHash,
                googleId: userData.sub,
                verificationToken,
                verificationTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
            },
        });

        const token = generateTokenAndSetCookie(res, newUser.id);
        await sendVerificationEmail(userData.email, verificationToken);

        res.status(200).json({ message: 'User created successfully', user: newUser, token });
    } catch (error) {
        console.error('Error signing up with Google', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
