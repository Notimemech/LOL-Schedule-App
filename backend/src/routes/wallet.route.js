import express from 'express';
import * as walletController from '../controllers/walletController.js';

export const walletRouter = express.Router();

walletRouter.get('/:userId', walletController.getBalance);
walletRouter.post('/deposit', walletController.deposit);
walletRouter.post('/withdraw', walletController.withdraw);
walletRouter.get('/transactions/:userId', walletController.getTransactions);

// API tạo URL thanh toán cho Frontend gọi (Cần middleware protect để xác thực user)
walletRouter.post('/create-payment-url', walletController.createPaymentUrl);

// API để VNPay redirect/gọi IPN trả kết quả về (KHÔNG được dùng protect ở đây vì VNPay gọi tới)
walletRouter.get('/vnpay-return', walletController.vnpayReturn);