import * as teamService from '../services/teamService.js';

export const getAllTeams = async(req,res)=>{
    try {
        const rs = await teamService.getAllTeams();
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const getTeamBySlug = async (req, res) =>{
    const {slug} = req.params;
    try {
        const rs = await teamService.getOneTeamBySlug(slug);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const createTeam = async(req,res)=>{
    try {
        const rs = await teamService.createTeam(req);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const updateTeam = async(req, res) =>{
    const {id} = req.params
    try {
        const rs = await teamService.updateTeam(id, req.body);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const deleteTeamBySlug = async(req, res) =>{
    const {slug} = req.params;
    try {
        await teamService.deleteTeamBySlug(slug);
        
        res.status(200).send({message: "Delete successfully!"})
    } catch (error) {
        res.status(500).send({error: error.message})
    }
}