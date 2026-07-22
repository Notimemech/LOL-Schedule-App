import * as companionRepository from '../repositories/companionRepository.js';
import AppError from '../utils/appError.js';

// Compute W/L form and current streak from newest-first finished matches.
const buildForm = (teamId, recentMatches) => {
    const form = recentMatches
        .filter(m => m.winner_team_id !== null)
        .map(m => (Number(m.winner_team_id) === Number(teamId) ? 'W' : 'L'));

    let streakCount = 0;
    let streakType = null;
    for (const result of form) {
        if (streakType === null) {
            streakType = result;
            streakCount = 1;
        } else if (result === streakType) {
            streakCount += 1;
        } else {
            break;
        }
    }

    return { form: form.slice(0, 5), streakCount, streakType };
};

export const getTeamProfile = async (slug, userId = null) => {
    const team = await companionRepository.getTeamBySlug(slug);
    if (!team) {
        throw new AppError('Team not found', 404);
    }

    const [recentMatches, upcomingMatches, matchStats, killStats] = await Promise.all([
        companionRepository.getTeamRecentMatches(team.id),
        companionRepository.getTeamUpcomingMatches(team.id),
        companionRepository.getTeamMatchStats(team.id),
        companionRepository.getTeamKillStats(team.id),
    ]);

    const { form, streakCount, streakType } = buildForm(team.id, recentMatches);
    const losses = matchStats.total - matchStats.wins;
    const winrate = matchStats.total > 0
        ? Math.round((matchStats.wins / matchStats.total) * 100)
        : null;

    const isFollowing = userId
        ? await companionRepository.isFollowingTeam(userId, team.id)
        : false;

    return {
        team,
        stats: {
            totalMatches: matchStats.total,
            wins: matchStats.wins,
            losses,
            winrate,
            gamesPlayed: killStats.games_played,
            avgKills: killStats.avg_kills,
            firstBloods: killStats.first_bloods,
            streakCount,
            streakType,
        },
        form,
        recentMatches,
        upcomingMatches,
        isFollowing,
    };
};

export const getHeadToHead = async (team1Id, team2Id) => {
    const [summary, recentMeetings] = await Promise.all([
        companionRepository.getHeadToHeadSummary(team1Id, team2Id),
        companionRepository.getHeadToHeadRecentMeetings(team1Id, team2Id),
    ]);

    return {
        totalMeetings: summary.total_meetings,
        team1Wins: summary.team1_wins,
        team2Wins: summary.team2_wins,
        recentMeetings,
    };
};

export const getTournamentStandings = async (tournamentId) => {
    return await companionRepository.getTournamentStandings(tournamentId);
};

export const getTournamentsWithTeams = async () => {
    return await companionRepository.getTournamentsWithTeams();
};

export const getTeamsWithGameType = async () => {
    return await companionRepository.getTeamsWithGameType();
};

export const followTeam = async (userId, teamId) => {
    if (!userId) {
        throw new AppError('userId is required', 400);
    }
    return await companionRepository.followTeam(userId, teamId);
};

export const unfollowTeam = async (userId, teamId) => {
    if (!userId) {
        throw new AppError('userId is required', 400);
    }
    return await companionRepository.unfollowTeam(userId, teamId);
};

export const getFollowedTeams = async (userId) => {
    return await companionRepository.getFollowedTeams(userId);
};

export const followMatch = async (userId, matchId) => {
    if (!userId) {
        throw new AppError('userId is required', 400);
    }
    return await companionRepository.followMatch(userId, matchId);
};

export const unfollowMatch = async (userId, matchId) => {
    if (!userId) {
        throw new AppError('userId is required', 400);
    }
    return await companionRepository.unfollowMatch(userId, matchId);
};

export const getFollowedMatchIds = async (userId) => {
    return await companionRepository.getFollowedMatchIds(userId);
};
