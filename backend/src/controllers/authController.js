import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        sendSuccess(res, 201, 'User registered successfully', user);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        sendSuccess(res, 200, 'Login successful', data);
    } catch (error) {
        next(error);
    }
};
