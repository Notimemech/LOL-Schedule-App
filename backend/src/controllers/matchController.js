import * as matchService from '../services/matchService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllMatches = async (req, res, next) => {
    try {
        const matches = await matchService.getAllMatches();
        sendSuccess(res, 200, 'Matches retrieved successfully', matches);
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

export const getMatchGames = async (req, res, next) => {
    try {
        const { id } = req.params;
        const games = await matchService.getMatchGames(id);
        sendSuccess(res, 200, 'Games retrieved successfully', games);
    } catch (error) {
        next(error);
    }
};

export const addGameToMatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const game = await matchService.addGameToMatch(id, req.body);
        sendSuccess(res, 201, 'Game created successfully', game);
    } catch (error) {
        next(error);
    }
};
