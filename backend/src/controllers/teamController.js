import * as teamService from '../services/teamService.js';
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