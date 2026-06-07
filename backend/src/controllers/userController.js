import * as userService from '../services/userService.js';

export const getAllUser = async(req,res)=>{
    try {
        const rs = await userService.getAllUser();
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const getUserById = async (req, res) =>{
    const {id} = req.params;
    try {
        const rs = await userService.getOneUser(id);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const createUser = async(req,res)=>{
    try {
        const rs = await userService.createUser(req);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const updateUser = async(req, res) =>{
    const {id} = req.params
    try {
        const rs = await userService.updateUser(id, req.body);
        res.status(200).json(rs);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const deleteUser = async(req, res) =>{
    const {id} = req.params;
    try {
        await userService.deleteUser(id);
        
        res.status(200).send({message: "Delete successfully!"})
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
            error: error.message
        });
    }
        res.status(500).send({error: error.message})
    }
}