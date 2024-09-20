import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDb } from './db/connectDb.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.listen(PORT, ()=>{
    connectDb();
    console.log(`Server is running on port ${PORT}`);
})