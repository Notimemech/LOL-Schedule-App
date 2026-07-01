import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllUser = async(req, res, next)=>{
    try {
        const rs = await userService.getAllUser();
        sendSuccess(res, 200, 'Users retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req, res, next) =>{
    const {id} = req.params;
    try {
        const rs = await userService.getOneUser(id);
        sendSuccess(res, 200, 'User retrieved successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const createUser = async(req, res, next)=>{
    try {
        const rs = await userService.createUser(req);
        sendSuccess(res, 201, 'User created successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const updateUser = async(req, res, next) =>{
    const {id} = req.params
    try {
        const rs = await userService.updateUser(id, req.body);
        sendSuccess(res, 200, 'User updated successfully', rs);
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async(req, res, next) =>{
    const {id} = req.params;
    try {
        await userService.deleteUser(id);
        sendSuccess(res, 200, 'Delete successfully!');
    } catch (error) {
        // We let the global error handler handle everything
        // Note: the original code returned 404 for 'USER_NOT_FOUND', which we could convert to an AppError in the service,
        // but for now, passing to next(error) is consistent.
        next(error);
    }
}