import express from 'express';
import  dotenv  from 'dotenv';
import { pool } from './config/db.config.js';
import cors from 'cors';
import { router } from './routes/index.route.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express()

app.use(cors());
app.use(express.json());
dotenv.config();

app.use('/api', router);

// Error handling middleware should be placed after all routes
app.use(errorHandler);

const port = Number(process.env.PORT || 9999);
const host = process.env.HOST || '0.0.0.0'; // bind to all interfaces by default

app.listen(port, host, () =>{
    console.log(`server is running on ${host}:${port}`)
})