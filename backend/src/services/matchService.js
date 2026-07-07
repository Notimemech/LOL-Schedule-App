import * as matchRepository from '../repositories/matchRepository.js';
import AppError from '../utils/appError.js';

export const createMatch = async (matchData) => {
    return await matchRepository.createMatch(matchData);
};

export const getAllMatches = async () => {
    return await matchRepository.getMatches();
};

export const updateMatch = async (matchId, updateData) => {
    const { state, team1_score, team2_score, winner_team_id } = updateData;
    const match = await matchRepository.updateMatchState(
        matchId, 
        state, 
        team1_score || 0, 
        team2_score || 0, 
        winner_team_id || null
    );
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    return match;
};


