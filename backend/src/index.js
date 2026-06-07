const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db/db.js')
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
dotenv.config();

const port = process.env.PORT;

app.listen(port, () =>{
    console.log("server is running on port ", port )
})