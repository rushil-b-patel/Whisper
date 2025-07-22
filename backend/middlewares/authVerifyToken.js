import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/envVariables.js';
import { prisma } from "../db/prismaClient.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];;
        if (!token) return res.status(401).json({ message: 'Not authorized' });
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.userId = user.id;
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(401).json({ message: 'Not authorized' });
    }
};
