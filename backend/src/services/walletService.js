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

export const createVNPayUrl = (amount, ipAddr, userId, promotionId) => {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const timeStamp = moment(date).format('DDHHmmss'); 
    
    // NHÚNG userId vào TxnRef để khi VNPay trả về, ta biết là của user nào
    // Format: "userId_timeStamp" hoặc "userId_timeStamp_promotionId"
    const orderId = promotionId ? `${userId}_${timeStamp}_${promotionId}` : `${userId}_${timeStamp}`; 

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

    const signDataParams = sortObject(vnp_Params);
    const signData = qs.stringify(signDataParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHashType'] = 'SHA512';
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(sortObject(vnp_Params), { encode: false });
    return {
        paymentUrl: vnpUrl,
        txnRef: orderId,
    };
};

export const createVnpayPaymentRecord = async (userId, txnRef, amount) => {
    return await walletRepository.createVnpayPayment(userId, txnRef, amount);
};

export const verifyVnpaySignature = (params) => {
    const copiedParams = { ...params };
    const secureHash = copiedParams['vnp_SecureHash'];
    delete copiedParams['vnp_SecureHash'];
    delete copiedParams['vnp_SecureHashType'];

    if (!secureHash) {
        throw new AppError('Missing vnp_SecureHash', 400);
    }

    const sortedParams = sortObject(copiedParams);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return { isValid: signed === secureHash, sortedParams };
};

export const handleVnpayReturn = async (params) => {
    const { isValid, sortedParams } = verifyVnpaySignature(params);
    if (!isValid) {
        throw new AppError('Dữ liệu VNPay không hợp lệ (Sai chữ ký)', 400);
    }

    const txnRef = sortedParams['vnp_TxnRef'];
    const responseCode = sortedParams['vnp_ResponseCode'];
    const amount = parseInt(sortedParams['vnp_Amount'], 10) / 100;

    const payment = await walletRepository.getVnpayPaymentByTxnRef(txnRef);
    if (!payment) {
        throw new AppError('Không tìm thấy đơn hàng VNPay', 404);
    }

    if (Number(payment.amount) !== Number(amount)) {
        await walletRepository.updateVnpayPaymentStatus(txnRef, 'failed', responseCode);
        throw new AppError('Số tiền thanh toán không khớp', 400);
    }

    if (payment.status === 'success') {
        return { status: 'success', alreadyProcessed: true, responseCode };
    }

    if (responseCode !== '00') {
        await walletRepository.updateVnpayPaymentStatus(txnRef, 'failed', responseCode);
        return { status: 'failed', responseCode };
    }

    await walletRepository.processDepositByVnpayPayment(txnRef, responseCode);
    return { status: 'success', alreadyProcessed: false, responseCode };
};