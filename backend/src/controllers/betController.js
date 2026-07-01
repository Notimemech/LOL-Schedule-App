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
