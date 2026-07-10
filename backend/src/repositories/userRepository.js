import { pool } from '../config/db.config.js';

export const createUser = async (username, password, role_id, phone, email) => {
    // email is NOT NULL UNIQUE in DB – generate a placeholder if not provided
    const resolvedEmail = email || `${username}_${Date.now()}@placeholder.local`;
    const query = `
        INSERT INTO users (username, password, role_id, phone, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [username, password, role_id, phone, resolvedEmail];
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
    // Search for 'user' or 'users' role
    const query = `SELECT * FROM roles WHERE name = 'user' OR name = 'users' LIMIT 1`;
    const { rows } = await pool.query(query);
    if (rows.length > 0) {
        return rows[0];
    }
    // Fallback to first available role
    const fallback = await pool.query('SELECT * FROM roles LIMIT 1');
    return fallback.rows[0];
};
