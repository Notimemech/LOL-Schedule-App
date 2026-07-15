import * as vipService from '../services/vipService.js';

export const getVipTiers = async (req, res, next) => {
    try {
        const tiers = await vipService.getVipTiers();
        res.status(200).json({ success: true, data: tiers });
    } catch (error) {
        next(error);
    }
};

export const buyVip = async (req, res, next) => {
    try {
        const { userId, tierId } = req.body;
        if (!userId || !tierId) {
            return res.status(400).json({ success: false, message: 'Thiếu userId hoặc tierId' });
        }
        const result = await vipService.buyVip(userId, tierId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
        const status = await vipService.getUserVipStatus(userId);
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        next(error);
    }
};

export const cancelAutoRenew = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
        const result = await vipService.cancelAutoRenew(userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const removeVip = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
        const result = await vipService.removeVip(userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
