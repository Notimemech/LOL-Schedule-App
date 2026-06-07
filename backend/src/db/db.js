import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    database: process.env.DB_DBNAME
})

const testConnection = async() =>{
    try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        console.log("DB connected successfully!")
    } catch (error) {
        console.log("DB connected failed!", error.message);
        process.exit(1);
    }
}

testConnection();

