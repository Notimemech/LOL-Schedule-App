import { pool } from '../config/db.config.js';
import * as betRepository from '../repositories/betRepository.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

export const createMarket = async (marketData) => {
    return await betRepository.createMarket(marketData);
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

        // Create transaction record
        await walletRepository.createTransaction(
            wallet.id,
            amount,
            'BET',
            'successed',
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
