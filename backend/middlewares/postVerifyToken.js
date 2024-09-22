import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { JWT_SECRET } from '../utils/envVariables.js';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token) {
        return res.status(401).json({success: false, message: 'Not authenticated'});
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        req.user = user;
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }
}
