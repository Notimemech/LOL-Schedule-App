import { pool } from '../config/db.config.js';

// ── Read ──────────────────────────────────────────────────────────

/** Paginated notifications for a user (newest first). */
export const getNotifications = async (userId, { limit = 10, offset = 0 } = {}) => {
    const result = await pool.query(
        'SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [userId, limit, offset]
    );
    return result.rows;
};

/** Count of unread notifications. */
export const getUnreadCount = async (userId) => {
    const result = await pool.query(
        'SELECT COUNT(*) AS count FROM Notifications WHERE user_id = $1 AND is_read = false',
        [userId]
    );
    return parseInt(result.rows[0].count, 10);
};

// ── Mark read ─────────────────────────────────────────────────────

export const markAsRead = async (userId, notificationId) => {
    const result = await pool.query(
        'UPDATE Notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [notificationId, userId]
    );
    return result.rows[0];
};

export const markAllRead = async (userId) => {
    await pool.query(
        'UPDATE Notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
        [userId]
    );
    return { success: true };
};

// ── Create ────────────────────────────────────────────────────────

/**
 * Insert a notification row.
 * @param {object|null} client  - pg client for transactions, or null to use pool
 * @param {string|number} userId
 * @param {string} title
 * @param {string} message
 * @param {string} [type='system']  - deposit|withdraw|bet|bet_cancel|promotion|follow_team|follow_match|vip|system
 */
export const createNotification = async (client, userId, title, message, type = 'system') => {
    const query = 'INSERT INTO Notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [userId, title, message, type];
    if (client) {
        return (await client.query(query, values)).rows[0];
    }
    return (await pool.query(query, values)).rows[0];
};

// ── Bailout (kept for compatibility) ─────────────────────────────

export const checkAndTriggerBailout = async (userId, walletBalance, client) => {
    if (parseFloat(walletBalance) > 10000) return;

    const query = `
        SELECT p.id 
        FROM UserPromotions up
        JOIN Promotions p ON up.promotion_id = p.id
        WHERE up.user_id = $1 AND p.badge_text = 'BAILOUT'
        AND up.created_at >= NOW() - INTERVAL '7 days'
    `;
    const res = await client.query(query, [userId]);
    if (res.rows.length > 0) return;

    const promoTitle = 'Bailout Gift: +20% Deposit Bonus';
    const promoSub = 'Special promotion for 2 hours only: Get a 20% deposit bonus to help you bounce back!';
    const promoRes = await client.query(
        `INSERT INTO Promotions (title, subtitle, badge_text, button_text, button_link, is_active, bonus_percentage, max_bonus)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [promoTitle, promoSub, 'BAILOUT', 'DEPOSIT NOW', 'Deposit', true, 20, 1000000]
    );
    const promoId = promoRes.rows[0].id;

    await client.query(
        `INSERT INTO UserPromotions (user_id, promotion_id, status) VALUES ($1, $2, $3)`,
        [userId, promoId, 'available']
    );

    await client.query(
        `INSERT INTO Notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
        [userId, '🎁 Special Bailout Gift!', 'Don\'t give up! We\'ve given you a +20% deposit bonus voucher (valid for 2 hours).', 'promotion']
    );
};
