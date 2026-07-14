import { pool } from '../config/db.config.js';

export const createMarket = async (marketData) => {
    const { match_id, market_type, options, closes_at } = marketData;
    const query = `
        INSERT INTO betmarkets (match_id, market_type, options, status, closes_at)
        VALUES ($1, $2, $3, 'open', $4)
        RETURNING *;
    `;
    const values = [match_id, market_type, JSON.stringify(options), closes_at];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getMarketsByMatchId = async (matchId) => {
    const query = `SELECT * FROM betmarkets WHERE match_id = $1`;
    const { rows } = await pool.query(query, [matchId]);
    return rows;
};

export const getMarketById = async (marketId) => {
    const query = `SELECT * FROM betmarkets WHERE id = $1`;
    const { rows } = await pool.query(query, [marketId]);
    return rows[0];
};

export const updateMarketStatus = async (marketId, status, resultOption = null) => {
    const query = `
        UPDATE betmarkets 
        SET status = $1, result_option = COALESCE($2, result_option)
        WHERE id = $3 
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, resultOption, marketId]);
    return rows[0];
};

export const createOdd = async (oddData) => {
    const { market_id, option_key, odd_value } = oddData;
    const query = `
        INSERT INTO odds (market_id, option_key, odd_value)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [market_id, option_key, odd_value];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getOddsByMarketId = async (marketId) => {
    const query = `SELECT * FROM odds WHERE market_id = $1`;
    const { rows } = await pool.query(query, [marketId]);
    return rows;
};

export const getLatestOdd = async (marketId, optionKey) => {
    const query = `
        SELECT * FROM odds 
        WHERE market_id = $1 AND option_key = $2 
        ORDER BY updated_at DESC LIMIT 1;
    `;
    const { rows } = await pool.query(query, [marketId, optionKey]);
    return rows[0];
};

export const createBet = async (betData, client = pool) => {
    const { user_id, market_id, option_key, amount, odd_snapshot, potential_win, ip_address } = betData;
    const query = `
        INSERT INTO bets (user_id, market_id, option_key, amount, odd_snapshot, potential_win, status, ip_address, placed_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
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

export const getBetsByUserIdAndMatchId = async (userId, matchId) => {
    const query = `
        SELECT b.*, 
               bm.market_type, 
               bm.status as market_status, 
               bm.result_option,
               bm.closes_at
        FROM bets b
        JOIN betmarkets bm ON b.market_id = bm.id
        WHERE b.user_id = $1 AND bm.match_id = $2
        ORDER BY b.placed_at DESC;
    `;
    const { rows } = await pool.query(query, [userId, matchId]);
    return rows;
};

export const getAllBetsByMatchId = async (matchId) => {
    const query = `
        SELECT b.id, b.option_key, b.placed_at, b.status,
               u.username, u.email,
               v.name as vip_name,
               bm.market_type, bm.status as market_status
        FROM bets b
        JOIN betmarkets bm ON b.market_id = bm.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN viptiers v ON u.vip_tier_id = v.id
        WHERE bm.match_id = $1
        ORDER BY b.placed_at DESC;
    `;
    const { rows } = await pool.query(query, [matchId]);
    return rows;
};

export const getBetById = async (betId) => {
    const query = `SELECT * FROM bets WHERE id = $1`;
    const { rows } = await pool.query(query, [betId]);
    return rows[0];
};

export const updateBetStatus = async (betId, status, client = pool) => {
    const query = `
        UPDATE bets 
        SET status = $1, settled_at = NOW() 
        WHERE id = $2 
        RETURNING *;
    `;
    const { rows } = await client.query(query, [status, betId]);
    return rows[0];
};

export const updateBetPayout = async (betId, status, payoutAmount, client = pool) => {
    const query = `
        UPDATE bets 
        SET status = $1, payout_amount = $2, settled_at = NOW() 
        WHERE id = $3 
        RETURNING *;
    `;
    const { rows } = await client.query(query, [status, payoutAmount, betId]);
    return rows[0];
};

export const getPendingBetsByMarketId = async (marketId, client = pool) => {
    const query = `
        SELECT * FROM bets 
        WHERE market_id = $1 AND status = 'pending'
        FOR UPDATE;
    `;
    const { rows } = await client.query(query, [marketId]);
    return rows;
};

export const getExpiredOpenMarkets = async () => {
    const query = `
        SELECT * FROM betmarkets 
        WHERE status = 'open' AND closes_at <= NOW();
    `;
    const { rows } = await pool.query(query);
    return rows;
};
