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
export const processDeposit = async (userId, originalAmount, txnRef, promotionId = null) => {
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
        
        let totalAmount = originalAmount;
        let bonusAmount = 0;

        // Xử lý promotion nếu có
        if (promotionId) {
            // Kiểm tra xem promotion có tồn tại và đang active
            const promoRes = await client.query(
                `SELECT bonus_percentage, max_bonus FROM Promotions WHERE id = $1 AND is_active = true FOR UPDATE`,
                [promotionId]
            );

            // Kiểm tra user đã dùng chưa
            const userPromoRes = await client.query(
                `SELECT 1 FROM UserPromotions WHERE user_id = $1 AND promotion_id = $2 FOR UPDATE`,
                [userId, promotionId]
            );

            if (promoRes.rows.length > 0 && userPromoRes.rows.length === 0) {
                const promo = promoRes.rows[0];
                bonusAmount = (originalAmount * promo.bonus_percentage) / 100;
                if (promo.max_bonus > 0 && bonusAmount > promo.max_bonus) {
                    bonusAmount = promo.max_bonus;
                }
                totalAmount += bonusAmount;

                // Ghi nhận đã dùng
                await client.query(
                    `INSERT INTO UserPromotions (user_id, promotion_id, status, used_at) VALUES ($1, $2, 'used', now())`,
                    [userId, promotionId]
                );
            }
        }

        // 2. Cập nhật số dư (Wallets)
        await client.query(
            `UPDATE wallets SET balance = balance + $1 WHERE id = $2`,
            [totalAmount, walletId]
        );

        // 3. Ghi log giao dịch (WalletTransactions) - original deposit
        await client.query(
            `INSERT INTO wallettransactions 
            (wallet_id, amount, type, status, reference_type, created_at) 
            VALUES ($1, $2, 'DEPOSIT', 'success', 'PAYMENT', now())`,
            [walletId, originalAmount]
        );
        
        // Ghi log giao dịch bonus nếu có
        if (bonusAmount > 0) {
            await client.query(
                `INSERT INTO wallettransactions 
                (wallet_id, amount, type, status, reference_type, reference_id, created_at) 
                VALUES ($1, $2, 'DEPOSIT', 'success', 'PROMOTION', $3, now())`,
                [walletId, bonusAmount, promotionId]
            );
        }

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