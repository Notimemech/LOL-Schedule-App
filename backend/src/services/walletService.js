import { pool } from '../config/db.config.js';
import * as walletRepository from '../repositories/walletRepository.js';
import AppError from '../utils/appError.js';

import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';

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
            'success',
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
            -amount,
            'WITHDRAW',
            'success',
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

// =====================================
// PHẦN LOGIC VNPAY
// =====================================

export const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};

export const createVNPayUrl = (amount, ipAddr, userId) => {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const timeStamp = moment(date).format('DDHHmmss'); 
    
    // NHÚNG userId vào TxnRef để khi VNPay trả về, ta biết là của user nào
    // Format: "userId_timeStamp" (Ví dụ: "2_150930")
    const orderId = `${userId}_${timeStamp}`; 

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Nap tien vao vi - GD: ${orderId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
    return vnpUrl;
};