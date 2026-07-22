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

// Full game detail: teams, gold, lineups with per-player stats, MVP and
// the key-event timeline. One payload so the app renders in a single fetch.
export const getGameDetail = async (id) => {
    const game = await gameRepository.getGameDetail(id);
    if (!game) {
        throw new AppError('Game not found', 404);
    }

    const [playerStats, events] = await Promise.all([
        gameRepository.getGamePlayerStats(id),
        gameRepository.getGameEvents(id),
    ]);

    const team1Players = playerStats.filter(p => Number(p.team_id) === Number(game.team1_id));
    const team2Players = playerStats.filter(p => Number(p.team_id) === Number(game.team2_id));
    const mvp = playerStats.find(p => p.is_mvp) || null;

    return {
        game,
        team1Players,
        team2Players,
        mvp,
        events,
    };
};

export const updateGameState = async (id, updateData) => {
    const game = await gameRepository.getGameById(id);
    if (!game) {
        throw new AppError('Game not found', 404);
    }
    return await gameRepository.updateGameState(id, updateData);
};
