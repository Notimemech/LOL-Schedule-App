import * as tournamentServices from '../services/tournamentService.js';

export const getAllTournament = async(req,res)=>{
    try {
        const rs = await tournamentServices.getAllTournament();
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const getTournamentById = async (req, res) =>{
    const {id} = req.params;
    try {
        const rs = await tournamentServices.getOneTournament(id);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const createTournament = async(req,res)=>{
    try {
        const rs = await tournamentServices.createTournament(req);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const updateTournaments = async(req, res) =>{
    const {id} = req.params
    try {
        const rs = await tournamentServices.updateTournaments(id, req.body);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const deleteTournaments = async(req, res) =>{
    const {id} = req.params;
    try {
        await tournamentServices.deleteTournaments(id);
        
        res.status(200).send({message: "Delete successfully!"})
    } catch (error) {
        if (error.message === "TOURNAMENT_NOT_FOUND") {
        return res.status(404).json({
            error: error.message
        });
    }
        res.status(500).send({error: error.message})
    }
}