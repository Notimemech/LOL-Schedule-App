import * as gameService from '../services/gameService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const createGame = async (req, res, next) => {
    try {
        const game = await gameService.createGame(req.body);
        sendSuccess(res, 201, 'Game created successfully', game);
    } catch (error) {
        next(error);
    }
};

export const getGameById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const game = await gameService.getGameById(id);
        sendSuccess(res, 200, 'Game retrieved successfully', game);
    } catch (error) {
        next(error);
    }
};

export const getGamesByMatchId = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const games = await gameService.getGamesByMatchId(matchId);
        sendSuccess(res, 200, 'Games retrieved successfully', games);
    } catch (error) {
        next(error);
    }
};

export const updateGameState = async (req, res, next) => {
    try {
        const { id } = req.params;
        const game = await gameService.updateGameState(id, req.body);
        sendSuccess(res, 200, 'Game updated successfully', game);
    } catch (error) {
        next(error);
    }
};
