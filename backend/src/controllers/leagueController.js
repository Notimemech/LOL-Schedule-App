import * as leagueService from '../services/leagueService.js';

export const getAllLeagues = async(req,res)=>{
    try {
        const rs = await leagueService.getAllLeagues();
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const getLeagueBySlug = async (req, res) =>{
    const {id} = req.params;
    try {
        const rs = await leagueService.getOneLeague(id);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const createLeague = async(req,res)=>{
    try {
        const rs = await leagueService.createLeague(req);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const updateLeague = async(req, res) =>{
    const {id} = req.params
    try {
        const rs = await leagueService.updateLeague(id, req.body);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const deleteLeagueBySlug = async(req, res) =>{
    const {id} = req.params;
    try {
        await leagueService.deleteLeague(id);
        
        res.status(200).send({message: "Delete successfully!"})
    } catch (error) {
        if (error.message === "LEAGUE_NOT_FOUND") {
        return res.status(404).json({
            error: error.message
        });
    }
        res.status(500).send({error: error.message})
    }
}