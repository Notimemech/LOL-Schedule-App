import express from 'express';
import { pool } from './config/db.config.js';
import dotenv from 'dotenv';
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

const port = process.env.PORT;

app.listen(port, () =>{
    console.log("server is running on port ", port )
})