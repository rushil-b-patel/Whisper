import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../nodeMailer/email.js';
import { User } from '../models/user.js';
import { computeEmailHash, generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { CLIENT_URI } from '../utils/envVariables.js';

export const login = async (req, res)=>{
    const { email, password } = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message: 'Please fill in all fields'});
        }
        
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: `User doesn't exist`});
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(400).json({message: 'Invalid password'});
        }
        if(!user.isVerified){
            return res.status(403).json({message: 'Email not verified. Please verify your email', redirect: true});
        }

        const token = generateTokenAndSetCookie(res, user._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                ...user._doc,
                password: null
            }
        })
    }
    catch(error){
        console.error("Error logging in",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const signup = async (req, res)=>{
    const { userName, email, password } = req.body;
    try{
        if(!userName || !email || !password){
            return res.status(400).json({message: 'Please fill in all fields'});
        }

        const userNameExist = await User.findOne({userName});
        if(userNameExist){
            return res.status(400).json({success:false, message: 'Username already exists'});
        }
        
        const emailHash = computeEmailHash(email);

        const userEmailExist = await User.findOne({ emailHash });
        if(userEmailExist){
            return res.status(400).json({success:false, message: 'Email already exists'});
        }
        
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            userName,
            emailHash,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: Date.now() + 1 * 60 * 60 * 1000,
        })

        await user.save();

        const token = generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                ...user._doc,
                password: null,
                email: undefined,
            }
        })

    }catch(error){
        res.status(500).json({message: 'Server Error'});
        console.error(error);
    }
}

export const verifyEmail = async (req, res)=>{
    const {code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpires: { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({success: false, message: 'Invalid or expired code. Please try again...', redirect: false});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                ...user._doc,
                password: null
            },
            redirect: true
        });
    }
    catch(error){
        console.error("Error verifying email",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const logout = async (req, res)=>{
    res.clearCookie('token');
    res.status(200).json({message: 'Logged out successfully'});
}

export const forgotPassword = async (req, res)=>{
    const {email} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message: 'User not found'});
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = Date.now() +  15 * 60 * 1000; 

        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpires = resetTokenExpires;
        await user.save();
        await sendPasswordResetEmail(user.email, `${CLIENT_URI}/reset-password/${resetToken}`);

        res.status(200).json({success: true, message: 'Password reset email sent'});
    }
    catch(error){
        console.error("Error forgetting password",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const resetPassword = async (req, res)=>{
    try{
        const { token } = req.params;
        const { password } = req.body;
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: Date.now() }
        })
        if(!user){
            return res.status(400).json({message: 'Invalid or expired token'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({success: true, message: 'Password reset successfully'});
    }
    catch(error){
        console.error("Error resetting password",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const checkAuth = async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json({message: 'User not found'});
        }
        const { _id, userName, email, bio, department, isVerified } = user;
        res.status(200).json({
            success: true,
            user: {
                _id,
                userName,
                email,
                bio,
                department,
                isVerified,
                password: null
            }
        })
    }
    catch(error){
        console.error("Error checking auth",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const updateUser = async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json({message: 'User not found', success: false});
        }
        const { userName, department, bio } = req.body;
        user.userName = userName;
        user.department = department;
        user.bio = bio;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                ...user._doc,
                password: null
            }
        })
    }
    catch(error){
        console.error("Error updating user",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const googleLogin = async (req, res) => {
    const { googleToken } = req.body;
    try{
        const userData = await verifyGoogleToken(googleToken);
        let user = await User.findOne({ email: userData.email});
        if(!user){
            return res.status(400).json({message: 'User not found. Please sign up'});
        }
        const token = generateTokenAndSetCookie(res, user._id);
        await user.save();
        return res.status(200).json({message: 'Google login success', token, user});        
    }
    catch(error){
        console.error("Error logging in with google",error);
        res.status(500).json({message: 'Server Error'});
    }
}

export const googleSignup = async (req, res) => {
    const { googleToken } = req.body;
    try{
        const userData = await verifyGoogleToken(googleToken);
        let user = await User.findOne({ email: userData.email });
        if(user){
            return res.status(400).json({ message: 'User already exists. Please log in.' });
        }
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        user = new User({
            userName: userData.name,
            email: userData.email,
            googleId: userData.sub,
            verificationToken,
            verificationTokenExpires: Date.now() + 1 * 60 * 60 * 1000,
        })
        await user.save();

        const token = generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);
        
        res.status(200).json({message: 'User created successfully', user, token});
    }
    catch(error){
        console.error("Error signing up with google",error);
        res.status(500).json({message: 'Server Error'});
    }
}