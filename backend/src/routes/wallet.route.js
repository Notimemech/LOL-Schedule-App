import express from 'express';
import * as walletController from '../controllers/walletController.js';

export const walletRouter = express.Router();

walletRouter.get('/:userId', walletController.getBalance);
walletRouter.post('/deposit', walletController.deposit);
walletRouter.post('/withdraw', walletController.withdraw);
walletRouter.get('/transactions/:userId', walletController.getTransactions);
