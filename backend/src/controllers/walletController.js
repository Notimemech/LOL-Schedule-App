import * as walletService from '../services/walletService.js';
import * as walletRepository from '../repositories/walletRepository.js';
import { sendSuccess } from '../utils/responseHandler.js';
import AppError from '../utils/appError.js';
import crypto from 'crypto';
import qs from 'qs';

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
        const { amount } = req.body;
        
        // Lấy ID người dùng từ token (middleware auth)
        // Lưu ý: Nếu middleware của bạn set user ID vào req.user.id thì dùng dòng dưới. 
        // Nếu set vào chỗ khác, hãy điều chỉnh lại cho phù hợp.
        const userId = req.user ? req.user.id : req.body.userId; 
        
        // Lấy IP của người dùng gửi request
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        if (!amount || amount <= 0) {
            return next(new AppError('Số tiền không hợp lệ', 400));
        }

        const paymentUrl = walletService.createVNPayUrl(amount, ipAddr, userId);
        
        // Trả URL về cho Frontend mở WebView sử dụng sendSuccess cho đồng bộ
        sendSuccess(res, 200, 'Payment URL created successfully', { paymentUrl });
    } catch (error) {
        next(error);
    }
};

// Hàm xử lý kết quả khi VNPay trả về
export const vnpayReturn = async (req, res, next) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Cần phải có hàm sortObject được export từ walletService
        vnp_Params = walletService.sortObject(vnp_Params); 

        const secretKey = process.env.VNP_HASH_SECRET;
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const amount = parseInt(vnp_Params['vnp_Amount'], 10) / 100; // Đưa về số tiền gốc
            const vnp_TxnRef = vnp_Params['vnp_TxnRef']; 
            
            // Tách userId từ TxnRef (Ví dụ TxnRef là "2_150930" thì lấy ra số 2)
            const userId = vnp_TxnRef.split('_')[0]; 

            if (responseCode === '00') {
                // Gọi tới Repository thực thi lệnh SQL cập nhật 2 bảng
                await walletRepository.processDeposit(userId, amount, vnp_TxnRef);
                
                // Giao dịch DB thành công, trả về trang HTML đơn giản cho React Native WebView đọc
                res.status(200).send(`
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="display:flex;justify-content:center;align-items:center;height:100vh;background-color:#1a1a2e;color:white;font-family:sans-serif;text-align:center;">
                            <div>
                                <h2 style="color:#4cd137;">Thanh toán thành công!</h2>
                                <p>Hệ thống đang chuyển hướng, vui lòng đợi...</p>
                            </div>
                        </body>
                    </html>
                `);
            } else {
                res.status(200).send('Giao dịch đã bị huỷ hoặc thất bại từ VNPay!');
            }
        } else {
            res.status(400).send('Dữ liệu không hợp lệ (Sai chữ ký)!');
        }
    } catch (error) {
        console.error("Lỗi IPN VNPay:", error);
        res.status(500).send('Lỗi máy chủ khi cập nhật ví!');
    }
};