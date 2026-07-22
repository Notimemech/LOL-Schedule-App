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
        // `identifier` may be an email or a username; older clients send `email`.
        const { identifier, email, username, password } = req.body;
        const data = await authService.login(identifier || email || username, password);
        sendSuccess(res, 200, 'Login successful', data);
    } catch (error) {
        next(error);
    }
};
