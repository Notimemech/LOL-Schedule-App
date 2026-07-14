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

export const createVnpayPayment = async (userId, txnRef, amount, client = pool) => {
    const query = `
        INSERT INTO vnpay_payments (user_id, txn_ref, amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *;
    `;
    const { rows } = await client.query(query, [userId, txnRef, amount]);
    return rows[0];
};

export const getVnpayPaymentByTxnRef = async (txnRef, client = pool) => {
    const query = `
        SELECT * FROM vnpay_payments WHERE txn_ref = $1;
    `;
    const { rows } = await client.query(query, [txnRef]);
    return rows[0];
};

export const updateVnpayPaymentStatus = async (txnRef, status, responseCode, client = pool) => {
    const query = `
        UPDATE vnpay_payments
        SET status = $1,
            response_code = $2,
            updated_at = now()
        WHERE txn_ref = $3
        RETURNING *;
    `;
    const { rows } = await client.query(query, [status, responseCode, txnRef]);
    return rows[0];
};

export const processDepositByVnpayPayment = async (txnRef, responseCode) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const paymentRes = await client.query(
            `SELECT * FROM vnpay_payments WHERE txn_ref = $1 FOR UPDATE`,
            [txnRef]
        );
        if (paymentRes.rows.length === 0) {
            throw new Error('VNPAY order not found');
        }

        const payment = paymentRes.rows[0];
        if (payment.status === 'success') {
            await client.query('COMMIT');
            return payment;
        }

        const walletRes = await client.query(
            `SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE`,
            [payment.user_id]
        );

        if (walletRes.rows.length === 0) {
            throw new Error('Wallet not found for user');
        }

        const walletId = walletRes.rows[0].id;

        await client.query(
            `UPDATE wallets SET balance = balance + $1 WHERE id = $2`,
            [payment.amount, walletId]
        );

        await client.query(
            `INSERT INTO wallettransactions 
            (wallet_id, amount, type, status, reference_type, reference_id) 
            VALUES ($1, $2, 'DEPOSIT', 'success', 'PAYMENT', $3)`,
            [walletId, payment.amount, payment.id]
        );

        await client.query(
            `UPDATE vnpay_payments SET status = 'success', response_code = $1, updated_at = now() WHERE txn_ref = $2`,
            [responseCode, txnRef]
        );

        await client.query('COMMIT');
        return payment;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Lỗi khi xử lý nạp tiền VNPay:', error);
        throw error;
    } finally {
        client.release();
    }
};

// ==========================================
// THÊM HÀM XỬ LÝ VNPay DÙNG CÚ PHÁP ES MODULE
// ==========================================
export const processDeposit = async (userId, originalAmount, txnRef, promotionId = null) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 0. Kiểm tra giao dịch đã được xử lý chưa
        const paymentRes = await client.query(
            `SELECT * FROM vnpay_payments WHERE txn_ref = $1 FOR UPDATE`,
            [txnRef]
        );
        if (paymentRes.rows.length > 0 && paymentRes.rows[0].status === 'success') {
            await client.query('COMMIT');
            return true; // Đã xử lý
        }

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
                const maxBonus = Number(promo.max_bonus);
                const bonusPercentage = Number(promo.bonus_percentage);
                
                bonusAmount = (Number(originalAmount) * bonusPercentage) / 100;
                if (maxBonus > 0 && bonusAmount > maxBonus) {
                    bonusAmount = maxBonus;
                }
                totalAmount = Number(originalAmount) + bonusAmount;

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

        // Cập nhật trạng thái vnpay_payments để IPN không xử lý lại
        await client.query(
            `UPDATE vnpay_payments SET status = 'success', response_code = '00', updated_at = now() WHERE txn_ref = $1`,
            [txnRef]
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