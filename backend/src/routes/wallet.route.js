import express from 'express';
import * as walletController from '../controllers/walletController.js';

export const walletRouter = express.Router();

walletRouter.post('/deposit', walletController.deposit);
walletRouter.post('/withdraw', walletController.withdraw);
walletRouter.post('/withdraw-vnpay', walletController.withdrawVnpay);
walletRouter.get('/vnpay-withdraw-return', walletController.vnpayWithdrawReturn);
walletRouter.post('/create-payment-url', walletController.createPaymentUrl);
walletRouter.get('/vnpay-return', walletController.vnpayReturn);
walletRouter.post('/vnpay-ipn', walletController.vnpayIpn);
walletRouter.get('/vnpay-ipn', walletController.vnpayIpn);
walletRouter.get('/transactions/:userId', walletController.getTransactions);
walletRouter.get('/:userId', walletController.getBalance);