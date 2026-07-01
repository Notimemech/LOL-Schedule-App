import { pool } from '../config/db.config.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

export const getBalance = async (userId) => {
    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
        throw new AppError('Wallet not found for this user', 404);
    }
    return wallet;
};

export const deposit = async (userId, amount) => {
    if (amount <= 0) {
        throw new AppError('Deposit amount must be greater than 0', 400);
    }

    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
        throw new AppError('Wallet not found', 404);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updatedWallet = await walletRepository.updateWalletBalance(wallet.id, amount, client);
        
        const transaction = await walletRepository.createTransaction(
            wallet.id,
            amount,
            'DEPOSIT',
            'successed',
            null,
            client
        );

        await client.query('COMMIT');
        return { wallet: updatedWallet, transaction };
    } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to deposit: ' + error.message, 500);
    } finally {
        client.release();
    }
};

export const withdraw = async (userId, amount) => {
    if (amount <= 0) {
        throw new AppError('Withdraw amount must be greater than 0', 400);
    }

    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
        throw new AppError('Wallet not found', 404);
    }

    if (parseFloat(wallet.balance) < amount) {
        throw new AppError('Insufficient balance', 400);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Negative amount for withdraw
        const updatedWallet = await walletRepository.updateWalletBalance(wallet.id, -amount, client);
        
        const transaction = await walletRepository.createTransaction(
            wallet.id,
            amount,
            'WITHDRAW',
            'successed',
            null,
            client
        );

        await client.query('COMMIT');
        return { wallet: updatedWallet, transaction };
    } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to withdraw: ' + error.message, 500);
    } finally {
        client.release();
    }
};

export const getTransactions = async (userId) => {
    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
        throw new AppError('Wallet not found', 404);
    }

    const transactions = await walletRepository.getTransactionsByWalletId(wallet.id);
    return transactions;
};
