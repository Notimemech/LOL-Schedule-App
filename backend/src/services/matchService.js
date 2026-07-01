import * as matchRepository from '../repositories/matchRepository.js';
import AppError from '../utils/appError.js';

export const createMatch = async (matchData) => {
    return await matchRepository.createMatch(matchData);
};

export const getAllMatches = async () => {
    return await matchRepository.getMatches();
};

export const updateMatch = async (matchId, updateData) => {
    const { state, team1_score, team2_score, winner_slug } = updateData;
    const match = await matchRepository.updateMatchState(
        matchId, 
        state, 
        team1_score || 0, 
        team2_score || 0, 
        winner_slug || null
    );
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    return match;
};

export const getMatchGames = async (matchId) => {
    return await matchRepository.getGamesByMatchId(matchId);
};

export const addGameToMatch = async (matchId, gameData) => {
    // Inject match_id into payload
    return await matchRepository.createGame({ ...gameData, match_id: matchId });
};
