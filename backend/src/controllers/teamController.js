import * as teamService from '../services/teamService.js';
import * as companionService from '../services/companionService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllTeams = async(req, res, next)=>{
    try {
        const rs = await teamService.getAllTeams();
        sendSuccess(res, 200, 'Teams retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const getTeamBySlug = async (req, res, next) =>{
    const {slug} = req.params;
    try {
        const rs = await teamService.getOneTeamBySlug(slug);
        sendSuccess(res, 200, 'Team retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const createTeam = async(req, res, next)=>{
    try {
        const rs = await teamService.createTeam(req);
        sendSuccess(res, 201, 'Team created successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const updateTeam = async(req, res, next) =>{
    const {id} = req.params
    try {
        const rs = await teamService.updateTeam(id, req.body);
        sendSuccess(res, 200, 'Team updated successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const deleteTeamBySlug = async(req, res, next) =>{
    const {slug} = req.params;
    try {
        await teamService.deleteTeamBySlug(slug);
        sendSuccess(res, 200, 'Delete successfully!');
    } catch (error) {
        next(error);
    }
}

// ===== Companion Hub =====

export const getTeamProfile = async (req, res, next) => {
    const { slug } = req.params;
    const { userId } = req.query;
    try {
        const rs = await companionService.getTeamProfile(slug, userId || null);
        sendSuccess(res, 200, 'Team profile retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
};

export const getHeadToHead = async (req, res, next) => {
    const { team1Id, team2Id } = req.params;
    try {
        const rs = await companionService.getHeadToHead(team1Id, team2Id);
        sendSuccess(res, 200, 'Head to head retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
};

export const followTeam = async (req, res, next) => {
    const { teamId } = req.params;
    const { userId } = req.body;
    try {
        await companionService.followTeam(userId, teamId);
        sendSuccess(res, 201, 'Team followed successfully');
    } catch (error) {
        next(error);
    }
};

export const unfollowTeam = async (req, res, next) => {
    const { teamId, userId } = req.params;
    try {
        await companionService.unfollowTeam(userId, teamId);
        sendSuccess(res, 200, 'Team unfollowed successfully');
    } catch (error) {
        next(error);
    }
};

export const getFollowedTeams = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const rs = await companionService.getFollowedTeams(userId);
        sendSuccess(res, 200, 'Followed teams retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
};