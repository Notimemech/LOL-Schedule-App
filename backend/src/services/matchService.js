import * as matchRepository from '../repositories/matchRepository.js';
import AppError from '../utils/appError.js';

export const createMatch = async (matchData) => {
    return await matchRepository.createMatch(matchData);
};

// Backward compatible: without `limit` the full array is returned (Home,
// Profile). With `limit` the response is paginated as { items, total, ... }.
export const getAllMatches = async (query = {}) => {
    const filters = {
        state: query.state,
        matchType: query.matchType,
        search: query.search,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
    };

    if (query.limit === undefined) {
        return await matchRepository.getMatches(filters);
    }

    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
    const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
    const [items, total] = await Promise.all([
        matchRepository.getMatches({ ...filters, limit, offset }),
        matchRepository.countMatches(filters),
    ]);
    return { items, total, limit, offset };
};

export const getMatchById = async (matchId) => {
    const match = await matchRepository.getMatchById(matchId);
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    return match;
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
