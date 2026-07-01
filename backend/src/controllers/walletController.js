import * as walletService from '../services/walletService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getBalance = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const wallet = await walletService.getBalance(userId);
        sendSuccess(res, 200, 'Wallet balance retrieved', wallet);
    } catch (error) {
        next(error);
    }
};

export const deposit = async (req, res, next) => {
    try {
        const { userId, amount } = req.body;
        const data = await walletService.deposit(userId, amount);
        sendSuccess(res, 200, 'Deposit successful', data);
    } catch (error) {
        next(error);
    }
};

export const withdraw = async (req, res, next) => {
    try {
        const { userId, amount } = req.body;
        const data = await walletService.withdraw(userId, amount);
        sendSuccess(res, 200, 'Withdrawal successful', data);
    } catch (error) {
        next(error);
    }
};

export const getTransactions = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const transactions = await walletService.getTransactions(userId);
        sendSuccess(res, 200, 'Transactions retrieved', transactions);
    } catch (error) {
        next(error);
    }
};
