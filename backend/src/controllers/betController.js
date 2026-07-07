import * as betService from '../services/betService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const createMarket = async (req, res, next) => {
    try {
        const market = await betService.createMarket(req.body);
        sendSuccess(res, 201, 'Market created successfully', market);
    } catch (error) {
        next(error);
    }
};

export const updateMarketStatus = async (req, res, next) => {
    try {
        const { marketId } = req.params;
        const { status, resultOption } = req.body;
        const market = await betService.updateMarketStatus(marketId, status, resultOption);
        sendSuccess(res, 200, 'Market status updated successfully', market);
    } catch (error) {
        next(error);
    }
};

export const createOdd = async (req, res, next) => {
    try {
        const odd = await betService.createOdd(req.body);
        sendSuccess(res, 201, 'Odd created successfully', odd);
    } catch (error) {
        next(error);
    }
};

export const getMatchMarkets = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const markets = await betService.getMatchMarketsAndOdds(matchId);
        sendSuccess(res, 200, 'Markets retrieved successfully', markets);
    } catch (error) {
        next(error);
    }
};

export const placeBet = async (req, res, next) => {
    try {
        // Assume userId is passed in body for now (should be in req.user from authMiddleware)
        const { userId, ...betData } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        const bet = await betService.placeBet(userId, betData, ipAddress);
        sendSuccess(res, 201, 'Bet placed successfully', bet);
    } catch (error) {
        next(error);
    }
};

export const getBetHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const history = await betService.getUserBetHistory(userId);
        sendSuccess(res, 200, 'Bet history retrieved successfully', history);
    } catch (error) {
        next(error);
    }
};

export const cancelBet = async (req, res, next) => {
    try {
        const { betId } = req.params;
        // userId should ideally come from req.user
        const { userId } = req.body; 
        
        const bet = await betService.cancelBet(userId, betId);
        sendSuccess(res, 200, 'Bet cancelled successfully', bet);
    } catch (error) {
        next(error);
    }
};

export const settleBet = async (req, res, next) => {
    try {
        const { betId } = req.params;
        const { outcome } = req.body; 
        
        const bet = await betService.settleBet(betId, outcome);
        sendSuccess(res, 200, 'Bet settled successfully', bet);
    } catch (error) {
        next(error);
    }
};
