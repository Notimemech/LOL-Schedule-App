import * as walletService from '../services/walletService.js';
import { sendSuccess } from '../utils/responseHandler.js';
import AppError from '../utils/appError.js';

const renderVnpayReturnPage = (status, message, responseCode) => {
    const payload = JSON.stringify({ status, responseCode });
    return `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>VNPAY Payment Result</title>
                <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: Arial, sans-serif; }
                    .card { max-width: 420px; width: 100%; padding: 28px; border-radius: 18px; background: #111827; box-shadow: 0 16px 40px rgba(0,0,0,0.25); text-align: center; }
                    .card h1 { margin-bottom: 16px; font-size: 24px; }
                    .card p { margin: 0; color: #cbd5e1; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>${message}</h1>
                    <p>Mã trả về: ${responseCode}</p>
                </div>
                <script>
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(${payload});
                    }
                </script>
            </body>
        </html>
    `;
};

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

// =====================================
// PHẦN CONTROLLER VNPAY
// =====================================

export const createPaymentUrl = async (req, res, next) => {
    try {
        const { amount, userId: userIdFromBody } = req.body;
        
        // Lấy ID người dùng từ token (middleware auth) hoặc payload body
        const userId = req.user?.id || userIdFromBody;
        
        if (!userId) {
            return next(new AppError('User ID is required to create the payment URL', 400));
        }

        // Lấy IP của người dùng gửi request
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        if (!amount || amount <= 0) {
            return next(new AppError('Số tiền không hợp lệ', 400));
        }

        const paymentUrl = await walletService.createVNPayUrl(amount, ipAddr, userId);
        
        sendSuccess(res, 200, 'Payment URL created successfully', { paymentUrl });
    } catch (error) {
        next(error);
    }
};

// Hàm xử lý kết quả khi VNPay trả về
export const vnpayReturn = async (req, res, next) => {
    try {
        const result = await walletService.handleVnpayReturn(req.query);
        const message = result.status === 'success'
            ? 'Thanh toán thành công!'
            : 'Thanh toán không thành công';
        res.status(200).send(renderVnpayReturnPage(result.status, message, result.responseCode));
    } catch (error) {
        console.error('Lỗi vnpayReturn:', error);
        const message = error.message || 'Thanh toán không thành công';
        res.status(400).send(renderVnpayReturnPage('failed', message, error.responseCode || '99'));
    }
};

export const vnpayIpn = async (req, res, next) => {
    try {
        const params = Object.keys(req.body).length ? req.body : req.query;
        const result = await walletService.handleVnpayReturn(params);

        if (result.status === 'success') {
            return res.status(200).send('OK');
        }

        return res.status(200).send('FAILED');
    } catch (error) {
        console.error('Lỗi vnpayIpn:', error);
        return res.status(400).send('FAILED');
    }
};