import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

export const register = async (userData) => {
    const { username, password, phone, email } = userData;

    if (!username || !password || !email) {
        throw new AppError('Username, password and email are required', 400);
    }

    // Usernames double as login identifiers and friend handles (username#TAG),
    // so whitespace is not allowed.
    if (/\s/.test(username)) {
        throw new AppError('Username cannot contain spaces', 400);
    }

    if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        throw new AppError('Email is already registered', 400);
    }

    const existingUsername = await userRepository.findUserByUsername(username);
    if (existingUsername) {
        throw new AppError('Username is already taken', 400);
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

export const login = async (identifier, password) => {
    if (!identifier || !password) {
        throw new AppError('Email/username and password are required', 400);
    }

    // Identifier is an email when it contains '@', otherwise a username.
    const user = identifier.includes('@')
        ? await userRepository.findUserByEmail(identifier)
        : await userRepository.findUserByUsername(identifier);
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    // In a real app, generate a JWT token here
    const token = 'mock-jwt-token-for-' + user.id;

    delete user.password;
    return { user, token };
};
