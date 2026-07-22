import * as matchService from '../services/matchService.js';
import * as companionService from '../services/companionService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllMatches = async (req, res, next) => {
    try {
        const matches = await matchService.getAllMatches(req.query);
        sendSuccess(res, 200, 'Matches retrieved successfully', matches);
    } catch (error) {
        next(error);
    }
};

export const getMatchById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await matchService.getMatchById(id);
        sendSuccess(res, 200, 'Match detail retrieved successfully', match);
    } catch (error) {
        next(error);
    }
};

export const createMatch = async (req, res, next) => {
    try {
        const match = await matchService.createMatch(req.body);
        sendSuccess(res, 201, 'Match created successfully', match);
    } catch (error) {
        next(error);
    }
};

export const updateMatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await matchService.updateMatch(id, req.body);
        sendSuccess(res, 200, 'Match updated successfully', match);
    } catch (error) {
        next(error);
    }
};

export const followMatch = async (req, res, next) => {
    const { matchId } = req.params;
    const { userId } = req.body;
    try {
        await companionService.followMatch(userId, matchId);
        sendSuccess(res, 201, 'Match followed successfully');
    } catch (error) {
        next(error);
    }
};

export const unfollowMatch = async (req, res, next) => {
    const { matchId, userId } = req.params;
    try {
        await companionService.unfollowMatch(userId, matchId);
        sendSuccess(res, 200, 'Match unfollowed successfully');
    } catch (error) {
        next(error);
    }
};

export const getFollowedMatches = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const rs = await companionService.getFollowedMatchIds(userId);
        sendSuccess(res, 200, 'Followed matches retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
};
