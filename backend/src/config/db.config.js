import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
    host: process.env.DB_HOST,
    database: process.env.DB_DBNAME
});

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

