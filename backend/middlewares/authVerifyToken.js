import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/envVariables.js';
import { User } from '../models/user.js';
import { sendError } from '../utils/sendResponse.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

        if (!token) {
            return sendError(res, 401, 'Unauthorized - No token provided');
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded || !decoded.id) {
            return sendError(res, 401, 'Unauthorized - Invalid token payload');
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return sendError(res, 401, 'Unauthorized - Invalid or expired token', {
            error: error.message,
        });
    }
};
