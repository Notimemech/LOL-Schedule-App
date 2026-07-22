import * as friendBetService from '../services/friendBetService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const createBet = async (req, res, next) => {
    const { creatorId, opponentId, matchId, name, stakeLabel, creatorTeamId } = req.body;
    try {
        const bet = await friendBetService.createBet({
            creatorId,
            opponentId,
            matchId,
            name,
            stakeLabel,
            creatorTeamId,
        });
        sendSuccess(res, 201, 'Friend bet created successfully', bet);
    } catch (error) {
        next(error);
    }
};

export const getHeadToHead = async (req, res, next) => {
    const { userId, friendId } = req.params;
    try {
        const result = await friendBetService.getHeadToHead(userId, friendId);
        sendSuccess(res, 200, 'Head-to-head retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

export const getWrapped = async (req, res, next) => {
    const { userId, friendId } = req.params;
    try {
        const result = await friendBetService.getWrapped(userId, friendId);
        sendSuccess(res, 200, 'Wrapped generated successfully', result);
    } catch (error) {
        next(error);
    }
};
