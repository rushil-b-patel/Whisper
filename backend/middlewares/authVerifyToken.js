import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/envVariables.js';
import { prisma } from '../db/prismaClient.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.userId = user.id;
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid or expired token' });
    }
};
