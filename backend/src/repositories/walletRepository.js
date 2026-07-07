import { pool } from '../config/db.config.js';

export const createWallet = async (user_id) => {
    const query = `
        INSERT INTO wallets (user_id, balance)
        VALUES ($1, 0)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows[0];
};

export const getWalletByUserId = async (user_id) => {
    const query = `SELECT * FROM wallets WHERE user_id = $1`;
    const { rows } = await pool.query(query, [user_id]);
    return rows[0];
};

export const updateWalletBalance = async (wallet_id, amount, client = pool) => {
    // amount can be negative or positive
    const query = `
        UPDATE wallets 
        SET balance = balance + $1 
        WHERE id = $2 
        RETURNING *;
    `;
    const { rows } = await client.query(query, [amount, wallet_id]);
    return rows[0];
};

export const createTransaction = async (wallet_id, amount, type, status, reference_id = null, client = pool) => {
    const query = `
        INSERT INTO wallettransactions (wallet_id, amount, type, status, reference_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [wallet_id, amount, type, status, reference_id];
    const { rows } = await client.query(query, values);
    return rows[0];
};

export const getTransactionsByWalletId = async (wallet_id) => {
    const query = `
        SELECT * FROM wallettransactions 
        WHERE wallet_id = $1 
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [wallet_id]);
    return rows;
};
