import * as tournamentServices from '../services/tournamentService.js';
import * as companionService from '../services/companionService.js';
import { sendSuccess } from '../utils/responseHandler.js';

// Explore tab: tournaments with their participating teams.
export const getTournamentsWithTeams = async (req, res, next) => {
    try {
        const rs = await companionService.getTournamentsWithTeams();
        sendSuccess(res, 200, 'Tournaments with teams retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
};

// Companion Hub: computed W/L standings for a tournament.
export const getTournamentStandings = async (req, res, next) => {
    const { id } = req.params;
    try {
        const rs = await companionService.getTournamentStandings(id);
        sendSuccess(res, 200, 'Standings retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
};

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