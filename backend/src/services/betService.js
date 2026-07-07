import { pool } from '../config/db.config.js';
import * as betRepository from '../repositories/betRepository.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

export const createMarket = async (marketData) => {
    return await betRepository.createMarket(marketData);
};

export const updateMarketStatus = async (marketId, status, resultOption) => {
    const validStatuses = ['open', 'suspended', 'closed', 'settled', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid market status', 400);
    }
    
    const market = await betRepository.getMarketById(marketId);
    if (!market) {
        throw new AppError('Market not found', 404);
    }

    return await betRepository.updateMarketStatus(marketId, status, resultOption);
};

export const createOdd = async (oddData) => {
    return await betRepository.createOdd(oddData);
};

export const getMatchMarketsAndOdds = async (matchId) => {
    const markets = await betRepository.getMarketsByMatchId(matchId);
    // Fetch odds for each market
    const marketsWithOdds = await Promise.all(markets.map(async (market) => {
        const odds = await betRepository.getOddsByMarketId(market.id);
        return { ...market, odds };
    }));
    return marketsWithOdds;
};

export const placeBet = async (userId, betData, ipAddress) => {
    const { market_id, option_key, amount } = betData;

    if (amount <= 0) {
        throw new AppError('Bet amount must be greater than 0', 400);
    }

    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet || parseFloat(wallet.balance) < amount) {
        throw new AppError('Insufficient balance to place bet', 400);
    }

    const latestOdd = await betRepository.getLatestOdd(market_id, option_key);
    if (!latestOdd) {
        throw new AppError('Odd not found for this option', 404);
    }

    const potentialWin = amount * parseFloat(latestOdd.odd_value);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Deduct from wallet
        await walletRepository.updateWalletBalance(wallet.id, -amount, client);

        // Create transaction record (BET must be negative per DB constraint)
        await walletRepository.createTransaction(
            wallet.id,
            -amount,
            'BET',
            'success',
            null,
            client
        );

        // Place bet
        const bet = await betRepository.createBet({
            user_id: userId,
            market_id,
            option_key,
            amount,
            odd_snapshot: latestOdd.odd_value,
            potential_win: potentialWin,
            ip_address: ipAddress
        }, client);

        await client.query('COMMIT');
        return bet;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to place bet: ' + error.message, 500);
    } finally {
        client.release();
    }
};

export const getUserBetHistory = async (userId) => {
    return await betRepository.getBetsByUserId(userId);
};

export const cancelBet = async (userId, betId) => {
    const bet = await betRepository.getBetById(betId);
    if (!bet) {
        throw new AppError('Bet not found', 404);
    }
    
    // Ensure the bet belongs to the user (compare as strings since DB returns string IDs)
    if (String(bet.user_id) !== String(userId)) {
        throw new AppError('Unauthorized to cancel this bet', 403);
    }
    
    if (bet.status !== 'pending') {
        throw new AppError('Only pending bets can be cancelled', 400);
    }

    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
        throw new AppError('Wallet not found', 404);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Refund the amount to the user's wallet
        await walletRepository.updateWalletBalance(wallet.id, bet.amount, client);

        // Record the refund transaction
        await walletRepository.createTransaction(
            wallet.id,
            bet.amount,
            'REFUND',
            'success',
            bet.id,
            client
        );

        // Update the bet status to 'cancelled'
        const cancelledBet = await betRepository.updateBetStatus(bet.id, 'cancelled', client);

        await client.query('COMMIT');
        return cancelledBet;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to cancel bet: ' + error.message, 500);
    } finally {
        client.release();
    }
};

export const settleBet = async (betId, outcome) => {
    if (!['won', 'lost'].includes(outcome)) {
        throw new AppError('Outcome must be "won" or "lost"', 400);
    }

    const bet = await betRepository.getBetById(betId);
    if (!bet) {
        throw new AppError('Bet not found', 404);
    }

    if (bet.status !== 'pending') {
        throw new AppError('Only pending bets can be settled', 400);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let payoutAmount = 0;
        if (outcome === 'won') {
            payoutAmount = bet.potential_win;

            // Credit user wallet
            const wallet = await walletRepository.getWalletByUserId(bet.user_id);
            if (!wallet) {
                throw new AppError('Wallet not found', 404);
            }

            await walletRepository.updateWalletBalance(wallet.id, payoutAmount, client);

            // Create payout transaction
            await walletRepository.createTransaction(
                wallet.id,
                payoutAmount,
                'PAYOUT',
                'success',
                bet.id,
                client
            );
        }

        // Update bet
        const settledBet = await betRepository.updateBetPayout(bet.id, outcome, payoutAmount, client);

        await client.query('COMMIT');
        return settledBet;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to settle bet: ' + error.message, 500);
    } finally {
        client.release();
    }
};
