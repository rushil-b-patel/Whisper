import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/envVariables.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - no token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized - invalid token' });
        }
        req.userId = decoded.id;        
        next();
    } catch (error) {
        console.error("Error verifying token", error);
        return res.status(401).json({ success: false, message: 'server error' });
    }
}
