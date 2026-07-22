import { pool } from '../config/db.config.js';

// ===== Support tickets =====

export const createTicket = async (userId, category, subject, message) => {
    const query = `
        INSERT INTO supporttickets (user_id, category, subject, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, category, subject, message]);
    return rows[0];
};

export const getTicketsByUserId = async (userId) => {
    const query = `
        SELECT id, category, subject, message, status, created_at
        FROM supporttickets
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};

// ===== Read-only diagnostics for the Help Center AI agent =====
// These queries are always scoped by the authenticated user's id injected
// server-side — the model can never choose whose data to read.

export const getWalletOverview = async (userId) => {
    const walletQuery = `SELECT id, balance, updated_at FROM wallets WHERE user_id = $1`;
    const { rows: walletRows } = await pool.query(walletQuery, [userId]);
    const wallet = walletRows[0] || null;

    let transactions = [];
    if (wallet) {
        const txQuery = `
            SELECT id, amount, type, status, reference_type, created_at
            FROM wallettransactions
            WHERE wallet_id = $1
            ORDER BY created_at DESC
            LIMIT 10;
        `;
        const { rows } = await pool.query(txQuery, [wallet.id]);
        transactions = rows;
    }

    const paymentsQuery = `
        SELECT amount, status, response_code, created_at
        FROM vnpay_payments
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5;
    `;
    const { rows: payments } = await pool.query(paymentsQuery, [userId]);

    return { wallet, recentTransactions: transactions, recentVnpayPayments: payments };
};

export const getRecentBets = async (userId) => {
    const query = `
        SELECT b.id, b.amount, b.odd_snapshot, b.potential_win, b.status AS bet_status,
               b.payout_amount, b.option_key, b.placed_at, b.settled_at,
               bm.market_type, bm.status AS market_status, bm.result_option, bm.closes_at,
               m.state AS match_state, m.scheduled_at AS match_time,
               t1.code AS team1_code, t2.code AS team2_code
        FROM bets b
        JOIN betmarkets bm ON b.market_id = bm.id
        JOIN matches m ON bm.match_id = m.id
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        WHERE b.user_id = $1
        ORDER BY b.placed_at DESC
        LIMIT 10;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};
