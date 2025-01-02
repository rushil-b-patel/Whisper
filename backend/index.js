import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDb } from './db/connectDb.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import { PORT } from './utils/envVariables.js';
import { CLIENT_URI } from './utils/envVariables.js';
import { CLIENT_URI_MOBILE } from './utils/envVariables.js';

const app = express();

app.use(cors({origin:[CLIENT_URI, CLIENT_URI_MOBILE], credentials: true}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/post', postRoutes);

app.get('/', (req, res) =>{
    res.send("Backend is running");
})

app.listen(PORT, ()=>{
    connectDb();
    console.log(`Server is running on port ${PORT}`);
})