import { sendVerificationEmail, sendWelcomeEmail } from '../nodeMailer/email.js';
import {User} from '../models/user.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res)=>{
    res.send('Login Route');
}

export const signup = async (req, res)=>{
    const { userName, email, password } = req.body;
    try{
        if(!userName || !email || !password){
            return res.status(400).json({message: 'Please fill in all fields'});
        }
        
        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({success:false, message: 'User already exists'});
        }
        
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            userName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: Date.now() + 1 * 60 * 60 * 1000,
        })

        await user.save();

        const token = generateToken(user._id);
        res.cookie('token', token, {
            htppOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                userName: user.userName,
                email: user.email,
                isVerified: user.isVerified
            }
        })

    }catch(error){
        res.status(500).json({message: 'Server Error'});
        console.error(error);
    }
}

export const verifyEmail = async (req, res)=>{
    const {data} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: data,
            verificationTokenExpires: { $gt: Date.now() }
        })
        if(!user){
            return res.status(400).json({message: 'Invalid or expired token'});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        
        await user.save();
        
        await sendWelcomeEmail(user.email, user.userName);
        
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                userName: user.userName,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    }
    catch(error){
        console.error("Error verifying email",error);
        res.status(500).json({message: 'Server Error'});
    }
}


export const logout = async (req, res)=>{
    res.send('Login Route');
}