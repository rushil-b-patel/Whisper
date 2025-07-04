import express from 'express';
import { login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, updateUser, googleLogin, googleSignup } from '../controllers/auth.js';
import { verifyToken } from '../middlewares/authVerifyToken.js';

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);

router.post('/signup', signup);
router.post('/login', login);
router.post('/google/login', googleLogin);
router.post('/google/signup', googleSignup);
router.post('/google/login', googleLogin);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.put('/update-user', verifyToken, updateUser);

export default router;