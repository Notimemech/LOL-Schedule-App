import * as tournamentServices from '../services/tournamentService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllTournament = async(req, res, next)=>{
    try {
        const rs = await tournamentServices.getAllTournament();
        sendSuccess(res, 200, 'Tournaments retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const getTournamentById = async (req, res, next) =>{
    const {id} = req.params;
    try {
        const rs = await tournamentServices.getOneTournament(id);
        sendSuccess(res, 200, 'Tournament retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const createTournament = async(req, res, next)=>{
    try {
        const rs = await tournamentServices.createTournament(req);
        sendSuccess(res, 201, 'Tournament created successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const updateTournaments = async(req, res, next) =>{
    const {id} = req.params
    try {
        const rs = await tournamentServices.updateTournaments(id, req.body);
        sendSuccess(res, 200, 'Tournament updated successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const deleteTournaments = async(req, res, next) =>{
    const {id} = req.params;
    try {
        await tournamentServices.deleteTournaments(id);
        sendSuccess(res, 200, 'Delete successfully!');
    } catch (error) {
        next(error);
    }
}