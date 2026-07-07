import bcrypt from 'bcrypt';
import { pool } from '../config/db.config.js';
import * as userRepository from '../repositories/userRepository.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

export const register = async (userData) => {
    const { username, password, phone, email } = userData;

    if (!username || !password || !phone) {
        throw new AppError('Username, password and phone are required', 400);
    }

    // Check username
    const existingUsername = await userRepository.findUserByUsername(username);
    if (existingUsername) {
        throw new AppError('Username is already taken', 400);
    }

    // Check phone
    const checkPhone = await pool.query('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (checkPhone.rowCount > 0) {
        throw new AppError('Phone number is already registered', 400);
    }

    // Check email if provided
    if (email) {
        const existingEmail = await userRepository.findUserByEmail(email);
        if (existingEmail) {
            throw new AppError('Email is already registered', 400);
        }
    }

    const role = await userRepository.getDefaultRole();
    if (!role) {
        throw new AppError('Default role not found', 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.createUser(username, hashedPassword, role.id, phone, email || null);

    // Initialize wallet
    await walletRepository.createWallet(newUser.id);

    // Return user without password
    delete newUser.password;
    return { ...newUser, vip_level: 0, balance: 0 };
};

export const login = async (emailOrUsernameOrPhone, password) => {
    if (!emailOrUsernameOrPhone || !password) {
        throw new AppError('Username/email/phone and password are required', 400);
    }

    // Try finding by email
    let user = await userRepository.findUserByEmail(emailOrUsernameOrPhone);
    if (!user) {
        // Try finding by username
        user = await userRepository.findUserByUsername(emailOrUsernameOrPhone);
    }
    if (!user) {
        // Try finding by phone
        const phoneQuery = `SELECT * FROM users WHERE phone = $1 LIMIT 1`;
        const phoneRs = await pool.query(phoneQuery, [emailOrUsernameOrPhone]);
        if (phoneRs.rowCount > 0) {
            user = phoneRs.rows[0];
        }
    }

    if (!user) {
        throw new AppError('Invalid username, email, phone or password', 401);
    }

    let isMatch = false;
    try {
        isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
        isMatch = false;
    }

    // Fallback: plain text check for seed users (who have '123456' plain text in database)
    if (!isMatch && password === user.password) {
        isMatch = true;
    }

    if (!isMatch) {
        throw new AppError('Invalid username, email, phone or password', 401);
    }

    // Get user wallet balance
    let balance = 0;
    try {
        const walletQuery = `SELECT balance FROM wallets WHERE user_id = $1 LIMIT 1`;
        const walletRs = await pool.query(walletQuery, [user.id]);
        if (walletRs.rowCount > 0) {
            balance = parseFloat(walletRs.rows[0].balance) || 0;
        }
    } catch (err) {
        console.warn('Failed to retrieve wallet balance:', err.message);
    }

    // Get vip level (default to 0 if not present in users schema yet, or fetch it)
    const vip_level = user.vip_level !== undefined ? user.vip_level : 0;

    const token = 'mock-jwt-token-for-' + user.id;

    delete user.password;
    return {
        user: {
            ...user,
            vip_level,
            balance
        },
        token
    };
};

