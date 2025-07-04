import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/envVariables.js';
import { User } from '../models/user.js';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - no token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized - invalid token' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.userId = decoded.id;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized - invalid token' });
    }
}
