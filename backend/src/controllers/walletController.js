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
        const { amount, userId: userIdFromBody, promotionId } = req.body;
        
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

        const { paymentUrl, txnRef } = walletService.createVNPayUrl(amount, ipAddr, userId, promotionId);
        await walletService.createVnpayPaymentRecord(userId, txnRef, amount);
        
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
            
            // Tách userId từ TxnRef (Ví dụ TxnRef là "2_150930" thì lấy ra số 2, hoặc "2_150930_1")
            const txnParts = vnp_TxnRef.split('_'); 
            const userId = txnParts[0];
            const promotionId = txnParts.length > 2 ? txnParts[2] : null;

            if (responseCode === '00') {
                // Gọi tới Repository thực thi lệnh SQL cập nhật 2 bảng
                await walletRepository.processDeposit(userId, amount, vnp_TxnRef, promotionId);
                
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