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

// ==========================================
// THÊM HÀM XỬ LÝ VNPay DÙNG CÚ PHÁP ES MODULE
// ==========================================
export const processDeposit = async (userId, amount, txnRef) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Tìm ví của user và lock (FOR UPDATE)
        const walletRes = await client.query(
            `SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE`, 
            [userId]
        );

        if (walletRes.rows.length === 0) {
            throw new Error('Không tìm thấy ví của người dùng này');
        }

        const walletId = walletRes.rows[0].id;

        // 2. Cập nhật số dư (Wallets)
        await client.query(
            `UPDATE wallets SET balance = balance + $1 WHERE id = $2`,
            [amount, walletId]
        );

        // 3. Ghi log giao dịch (WalletTransactions)
        // Enum: type = 'DEPOSIT', status = 'success', reference_type = 'PAYMENT'
        await client.query(
            `INSERT INTO wallettransactions 
            (wallet_id, amount, type, status, reference_type, created_at) 
            VALUES ($1, $2, 'DEPOSIT', 'success', 'PAYMENT', now())`,
            [walletId, amount]
        );

        await client.query('COMMIT');
        return true;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi xử lý nạp tiền DB:", error);
        throw error;
    } finally {
        client.release();
    }
};