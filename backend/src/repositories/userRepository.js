import { pool } from '../config/db.config.js';

export const createUser = async (username, password, role_id, phone, email) => {
    const query = `
        INSERT INTO users (username, password, role_id, phone, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [username, password, role_id, phone, email];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
};

export const findUserByUsername = async (username) => {
    const query = `SELECT * FROM users WHERE username = $1`;
    const { rows } = await pool.query(query, [username]);
    return rows[0];
};

export const getDefaultRole = async () => {
    const query = `SELECT * FROM roles WHERE name = 'users' LIMIT 1`;
    const { rows } = await pool.query(query);
    return rows[0];
};
