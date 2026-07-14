import { pool } from '../config/db.config.js';

export const getNotifications = async (userId) => {
    const result = await pool.query('SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
};

export const markAsRead = async (userId, notificationId) => {
    const result = await pool.query(
        'UPDATE Notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [notificationId, userId]
    );
    return result.rows[0];
};

export const createNotification = async (client, userId, title, message) => {
    const query = 'INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, title, message];
    if (client) {
        return (await client.query(query, values)).rows[0];
    } else {
        return (await pool.query(query, values)).rows[0];
    }
};

export const checkAndTriggerBailout = async (userId, walletBalance, client) => {
    if (parseFloat(walletBalance) > 10000) return;

    // Check if user got bailout in last 7 days
    const query = `
        SELECT p.id 
        FROM UserPromotions up
        JOIN Promotions p ON up.promotion_id = p.id
        WHERE up.user_id = $1 AND p.badge_text = 'BAILOUT'
        AND up.created_at >= NOW() - INTERVAL '7 days'
    `;
    const res = await client.query(query, [userId]);
    if (res.rows.length > 0) return;

    const promoTitle = 'Quà Cứu Thua: +20% Nạp Tiền';
    const promoSub = 'Khuyến mãi đặc biệt chỉ trong 2 giờ: Tặng 20% nạp tiền để giúp bạn lội ngược dòng!';
    const promoRes = await client.query(
        `INSERT INTO Promotions (title, subtitle, badge_text, button_text, button_link, is_active, bonus_percentage, max_bonus)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [promoTitle, promoSub, 'BAILOUT', 'NẠP NGAY', 'Deposit', true, 20, 1000000]
    );
    const promoId = promoRes.rows[0].id;

    await client.query(
        `INSERT INTO UserPromotions (user_id, promotion_id, status) VALUES ($1, $2, $3)`,
        [userId, promoId, 'available']
    );

    await client.query(
        `INSERT INTO Notifications (user_id, title, message) VALUES ($1, $2, $3)`,
        [userId, '🎁 Quà Cứu Thua Đặc Biệt!', 'Đừng nản chí! Tặng bạn voucher +20% nạp tiền (giới hạn 2 tiếng).']
    );
};
