import express from 'express';
import  dotenv  from 'dotenv';
import { pool } from './db/db.js';
import cors from 'cors';
import { router } from './router/index.route.js';

const app = express()

app.use(cors());
app.use(express.json());
dotenv.config();

app.use('/api', router);

const port = process.env.PORT;

app.listen(port, () =>{
    console.log("server is running on port ", port )
})