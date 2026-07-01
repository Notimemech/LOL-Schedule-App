import * as leagueService from '../services/leagueService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllLeagues = async(req, res, next)=>{
    try {
        const rs = await leagueService.getAllLeagues();
        sendSuccess(res, 200, 'Leagues retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const getLeagueBySlug = async (req, res, next) =>{
    const {slug} = req.params;
    try {
        const rs = await leagueService.getOneLeague(slug);
        sendSuccess(res, 200, 'League retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const createLeague = async(req, res, next)=>{
    try {
        const rs = await leagueService.createLeague(req);
        sendSuccess(res, 201, 'League created successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const updateLeague = async(req, res, next) =>{
    const {id} = req.params
    try {
        const rs = await leagueService.updateLeague(id, req.body);
        sendSuccess(res, 200, 'League updated successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const deleteLeagueBySlug = async(req, res, next) =>{
    const {slug} = req.params;
    try {
        await leagueService.deleteLeague(slug);
        sendSuccess(res, 200, 'Delete successfully!');
    } catch (error) {
        next(error);
    }
}