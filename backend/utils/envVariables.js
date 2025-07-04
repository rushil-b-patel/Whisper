import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
export const GMAIL_USER = process.env.GMAIL_USER;
export const GMAIL_PASS = process.env.GMAIL_PASS;
export const CLIENT_URI = process.env.CLIENT_URI;
export const CLIENT_URI_MOBILE = process.env.CLIENT_URI_MOBILE;
export const NODE_ENV = process.env.NODE_ENV;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const SECRET_KEY = process.env.SECRET_KEY;