import jwt from 'jsonwebtoken';
import { JWT_SECRET, NODE_ENV } from './envVariables.js';

export const generateTokenAndSetCookie = (res, id) =>{
    const token = jwt.sign({id}, JWT_SECRET, {expiresIn: '7d'});

    res.cookie('token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return token;
}