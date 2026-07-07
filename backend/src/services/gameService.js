import * as gameRepository from '../repositories/gameRepository.js';
import AppError from '../utils/appError.js';

export const createGame = async (gameData) => {
    return await gameRepository.createGame(gameData);
};

export const getGameById = async (id) => {
    const game = await gameRepository.getGameById(id);
    if (!game) {
        throw new AppError('Game not found', 404);
    }
    return game;
};

export const getGamesByMatchId = async (matchId) => {
    return await gameRepository.getGamesByMatchId(matchId);
};

export const updateGameState = async (id, updateData) => {
    const game = await gameRepository.getGameById(id);
    if (!game) {
        throw new AppError('Game not found', 404);
    }
    return await gameRepository.updateGameState(id, updateData);
};
