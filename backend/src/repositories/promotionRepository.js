import { pool } from '../config/db.config.js';

export const getActivePromotion = async (userId) => {
    const query = `
        SELECT p.*, 
               EXISTS(SELECT 1 FROM UserPromotions up WHERE up.promotion_id = p.id AND up.user_id = $1) as is_used
        FROM Promotions p
        WHERE p.is_active = true 
        ORDER BY p.id DESC 
        LIMIT 1;
    `;
    const result = await pool.query(query, [userId || -1]);
    return result.rows[0];
};

export const getAllPromotions = async (userId) => {
    const query = `
        SELECT p.*, 
               EXISTS(SELECT 1 FROM UserPromotions up WHERE up.promotion_id = p.id AND up.user_id = $1) as is_used
        FROM Promotions p
        WHERE p.user_id IS NULL OR p.user_id = $1
        ORDER BY p.is_active DESC, p.id DESC;
    `;
    const result = await pool.query(query, [userId || -1]);
    return result.rows;
};

