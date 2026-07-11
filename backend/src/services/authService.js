import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

export const register = async (userData) => {
    const { username, password, phone, email } = userData;

    if (!username || !password || !email) {
        throw new AppError('Username, password and email are required', 400);
    }

    if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        throw new AppError('Email is already registered', 400);
    }

    const role = await userRepository.getDefaultRole();
    if (!role) {
        throw new AppError('Default role not found', 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.createUser(username, hashedPassword, role.id, phone, email);

    // Initialize wallet
    await walletRepository.createWallet(newUser.id);

    // Return user without password
    delete newUser.password;
    return newUser;
};

export const login = async (email, password) => {
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    // In a real app, generate a JWT token here
    const token = 'mock-jwt-token-for-' + user.id;

    delete user.password;
    return { user, token };
};
