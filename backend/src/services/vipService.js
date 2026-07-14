import { pool } from '../config/db.config.js';

export const getVipTiers = async () => {
    const result = await pool.query('SELECT * FROM VipTiers ORDER BY id ASC');
    return result.rows;
};

export const buyVip = async (userId, tierId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Get tier info
        const tierResult = await client.query('SELECT * FROM VipTiers WHERE id = $1', [tierId]);
        if (tierResult.rows.length === 0) {
            throw new Error('Gói VIP không tồn tại');
        }
        const tier = tierResult.rows[0];
        const price = tier.price_per_month;

        // 2. Check user wallet balance
        const walletResult = await client.query('SELECT id, balance FROM Wallets WHERE user_id = $1 FOR UPDATE', [userId]);
        if (walletResult.rows.length === 0) {
            throw new Error('Ví không tồn tại');
        }
        const wallet = walletResult.rows[0];
        
        if (parseFloat(wallet.balance) < parseFloat(price)) {
            throw new Error('Số dư không đủ để mua gói VIP này');
        }

        // 3. Deduct balance
        const newBalance = parseFloat(wallet.balance) - parseFloat(price);
        await client.query('UPDATE Wallets SET balance = $1 WHERE id = $2', [newBalance, wallet.id]);

        await client.query(
            `INSERT INTO WalletTransactions (wallet_id, amount, type, status, reference_type, reference_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [wallet.id, -price, 'WITHDRAW', 'success', 'MANUAL', null]
        );

        // 4. Update user vip status (valid for 30 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await client.query(
            `UPDATE Users SET vip_tier_id = $1, vip_expires_at = $2, is_vip_auto_renew = true WHERE id = $3`,
            [tierId, expiresAt, userId]
        );

        // 5. Add promotion
        const promoTitle = `Thưởng Nạp ${tier.name} ${tier.deposit_bonus_percent}%`;
        const promoRes = await client.query(
            `INSERT INTO Promotions (title, subtitle, badge_text, button_text, button_link, is_active, bonus_percentage, max_bonus) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                promoTitle, 
                `Quà tặng mua gói ${tier.name}. Thưởng ${tier.deposit_bonus_percent}% cho lần nạp tiếp theo.`, 
                'VIP BONUS', 
                'NẠP NGAY', 
                'Deposit', 
                true, 
                tier.deposit_bonus_percent, 
                2000000
            ]
        );
        const promoId = promoRes.rows[0].id;

        await client.query(
            `INSERT INTO UserPromotions (user_id, promotion_id, status) VALUES ($1, $2, $3)`,
            [userId, promoId, 'available']
        );

        await client.query('COMMIT');
        return { success: true, message: 'Mua VIP thành công!', vip_tier_id: tierId, expires_at: expiresAt };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const getUserVipStatus = async (userId) => {
    const result = await pool.query(
        `SELECT u.vip_tier_id, u.vip_expires_at, u.is_vip_auto_renew, v.name as vip_name, v.bet_cashback_percent, v.min_bet_for_cashback 
         FROM Users u 
         LEFT JOIN VipTiers v ON u.vip_tier_id = v.id 
         WHERE u.id = $1`, [userId]);
    return result.rows[0];
};

export const cancelAutoRenew = async (userId) => {
    const result = await pool.query(
        `UPDATE Users SET is_vip_auto_renew = false WHERE id = $1 RETURNING *`,
        [userId]
    );
    if (result.rows.length === 0) throw new Error('User not found');
    return { success: true, message: 'Auto-renewal has been cancelled.' };
};
