import * as friendBetRepository from '../repositories/friendBetRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import { assertFriends } from './friendService.js';
import { chatCompletion, isLlmConfigured } from './llmClient.js';
import AppError from '../utils/appError.js';

export const createBet = async ({ creatorId, opponentId, matchId, name, stakeLabel, creatorTeamId }) => {
    if (!creatorId || !opponentId || !matchId || !creatorTeamId) {
        throw new AppError('creatorId, opponentId, matchId and creatorTeamId are required', 400);
    }
    if (!name?.trim() || !stakeLabel?.trim()) {
        throw new AppError('Bet name and stake are required', 400);
    }

    await assertFriends(creatorId, opponentId);

    const match = await friendBetRepository.getMatchForBet(matchId);
    if (!match) throw new AppError('Match not found', 404);
    if (match.state !== 'upcoming' || new Date(match.scheduled_at) <= new Date()) {
        throw new AppError('Friend bets can only be created before the match starts', 400);
    }

    const teamIds = [Number(match.team1_id), Number(match.team2_id)];
    const pickedTeam = Number(creatorTeamId);
    if (!teamIds.includes(pickedTeam)) {
        throw new AppError('creatorTeamId does not play in this match', 400);
    }
    // The opponent automatically backs the other side.
    const opponentTeamId = teamIds.find((id) => id !== pickedTeam);

    return await friendBetRepository.createFriendBet({
        matchId,
        name: name.trim().slice(0, 100),
        stakeLabel: stakeLabel.trim().slice(0, 100),
        creatorId,
        opponentId,
        creatorTeamId: pickedTeam,
        opponentTeamId,
    });
};

const buildTally = (bets, userId) => {
    const tally = { myWins: 0, friendWins: 0, active: 0, voids: 0 };
    for (const bet of bets) {
        if (bet.status === 'active') tally.active++;
        else if (bet.status === 'void') tally.voids++;
        else if (Number(bet.winner_user_id) === Number(userId)) tally.myWins++;
        else tally.friendWins++;
    }
    return tally;
};

export const getHeadToHead = async (userId, friendId) => {
    if (!userId || !friendId) throw new AppError('userId and friendId are required', 400);

    // Lazy settlement keeps results correct without a background job.
    await friendBetRepository.settleBetsForPair(userId, friendId);

    const bets = await friendBetRepository.getBetsBetween(userId, friendId);
    return { bets, tally: buildTally(bets, userId) };
};

// ===== AI Wrapped =====

// Deterministic fallback so Wrapped always works, even without an LLM key.
const buildFallbackSlides = (me, friend, tally, settled) => [
    {
        title: 'HEAD TO HEAD',
        text: `${me.username} vs ${friend.username}`,
        highlight: `${tally.myWins} - ${tally.friendWins}`,
    },
    {
        title: 'TOTAL WAGERS',
        text: 'Kèo đã chốt giữa hai bạn',
        highlight: String(settled.length),
    },
    {
        title: 'CHAMPION',
        text: tally.myWins === tally.friendWins ? 'Cân tài cân sức!' : 'Người đang dẫn trước',
        highlight:
            tally.myWins === tally.friendWins
                ? 'DRAW'
                : tally.myWins > tally.friendWins
                    ? me.username
                    : friend.username,
    },
];

export const getWrapped = async (userId, friendId) => {
    const { bets, tally } = await getHeadToHead(userId, friendId);
    const settled = bets.filter((bet) => bet.status === 'settled');
    if (settled.length === 0) {
        throw new AppError('No settled friend bets yet — finish a wager first!', 400);
    }

    const [me, friend] = await Promise.all([
        userRepository.findUserById(userId),
        userRepository.findUserById(friendId),
    ]);

    if (!isLlmConfigured()) {
        return { slides: buildFallbackSlides(me, friend, tally, settled), generatedBy: 'fallback' };
    }

    const betSummaries = settled.map((bet) => ({
        name: bet.name,
        stake: bet.stake_label,
        league: bet.league_name,
        creatorPicked: bet.creator_team_code,
        opponentPicked: bet.opponent_team_code,
        creatorIsMe: Number(bet.creator_id) === Number(userId),
        winner:
            bet.winner_user_id == null
                ? 'void'
                : Number(bet.winner_user_id) === Number(userId)
                    ? me.username
                    : friend.username,
    }));

    const prompt = `Create a fun "Spotify Wrapped"-style recap of friendly esports wagers between two friends.
User asking: "${me.username}". Their friend: "${friend.username}".
Score (asking user first): ${tally.myWins}-${tally.friendWins}. Wagers (JSON): ${JSON.stringify(betSummaries)}

Return ONLY a JSON object, no markdown fences, in this exact shape:
{"slides":[{"title":"...","text":"...","highlight":"..."}]}
Rules: 5-6 slides, Vietnamese language, playful trash-talk tone (friendly, never mean),
title <= 4 words uppercase, text <= 25 words, highlight is a short number/name/phrase.
Include: the rivalry score, total wagers, who leads, a funny superlative based on the wager names/stakes, and a closing hype slide.`;

    try {
        const message = await chatCompletion({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.9,
        });
        const raw = (message.content || '').replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) throw new Error('bad shape');
        return { slides: parsed.slides.slice(0, 8), generatedBy: 'ai' };
    } catch (error) {
        console.error('Wrapped generation failed, using fallback:', error.message);
        return { slides: buildFallbackSlides(me, friend, tally, settled), generatedBy: 'fallback' };
    }
};
