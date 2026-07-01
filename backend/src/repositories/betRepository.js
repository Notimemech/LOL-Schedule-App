import { pool } from '../config/db.config.js';

export const createMarket = async (marketData) => {
    const { match_id, market_type, option, closed_at } = marketData;
    const query = `
        INSERT INTO betmarkets (match_id, market_type, option, status, closed_at)
        VALUES ($1, $2, $3, 'open', $4)
        RETURNING *;
    `;
    const values = [match_id, market_type, JSON.stringify(option), closed_at];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getMarketsByMatchId = async (matchId) => {
    const query = `SELECT * FROM betmarkets WHERE match_id = $1`;
    const { rows } = await pool.query(query, [matchId]);
    return rows;
};

export const createOdd = async (oddData) => {
    const { market_id, options_key, odd_value } = oddData;
    const query = `
        INSERT INTO odds (market_id, options_key, odd_value)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [market_id, options_key, odd_value];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getOddsByMarketId = async (marketId) => {
    const query = `SELECT * FROM odds WHERE market_id = $1`;
    const { rows } = await pool.query(query, [marketId]);
    return rows;
};

export const getLatestOdd = async (marketId, optionsKey) => {
    const query = `
        SELECT * FROM odds 
        WHERE market_id = $1 AND options_key = $2 
        ORDER BY updated_at DESC LIMIT 1;
    `;
    const { rows } = await pool.query(query, [marketId, optionsKey]);
    return rows[0];
};

export const createBet = async (betData, client = pool) => {
    const { user_id, market_id, option_key, amount, odd_snapshot, potential_win, ip_address } = betData;
    const query = `
        INSERT INTO bets (user_id, market_id, option_key, amount, odd_snapshot, potential_win, status, ip_address, placed_at, settled_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW(), NOW())
        RETURNING *;
    `;
    const values = [user_id, market_id, option_key, amount, odd_snapshot, potential_win, ip_address];
    const { rows } = await client.query(query, values);
    return rows[0];
};

export const getBetsByUserId = async (userId) => {
    const query = `
        SELECT b.*, m.match_id, m.market_type 
        FROM bets b
        JOIN betmarkets m ON b.market_id = m.id
        WHERE b.user_id = $1
        ORDER BY b.placed_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};
