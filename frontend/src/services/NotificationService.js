/**
 * NotificationService
 * Quản lý local notifications: khuyến mãi, OTP nạp/rút, thông báo VIP
 * Dùng expo-notifications (đã có sẵn trong expo SDK)
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Cấu hình handler hiển thị notification khi app đang foreground
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

class NotificationService {
  constructor() {
    this._otpTimers = {};
  }

  // ─── Permissions ────────────────────────────────────────────
  async requestPermissions() {
    if (Platform.OS === 'web') return false;
    try {
      if (!Device.isDevice) {
        console.warn('[Notif] Running on emulator – notifications may not work.');
        return false;
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('[Notif] Permission not granted');
        return false;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'BetGaming',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00F5E1',
        });
      }
      return true;
    } catch (e) {
      console.warn('[Notif] Error requesting permissions:', e);
      return false;
    }
  }

  // ─── Generic local notification ──────────────────────────────
  async sendLocal({ title, body, data = {} }) {
    if (Platform.OS === 'web') {
      console.log(`[Notif Web] ${title}: ${body}`);
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: null, // fire immediately
      });
    } catch (e) {
      console.warn('[Notif] Error sending local notification:', e);
    }
  }

  // ─── OTP Notification (nạp / rút tiền / đăng ký) ──────────────
  /**
   * Gọi khi user bắt đầu nạp / rút hoặc đăng ký.
   * @param {string} type
   * @param {object} user  { phone, email }
   * @param {number} amount
   */
  async sendOTP(type, user, amount = 0) {
    const otp = this._generateOTP();
    const action = type === 'register' ? 'ĐĂNG KÝ' : (type === 'deposit' ? 'NẠP TIỀN' : 'RÚT TIỀN');
    const amountFmt = new Intl.NumberFormat('vi-VN').format(amount);

    const contactInfo = user?.phone
      ? `SĐT: ${user.phone}`
      : `Email: ${user?.email || 'N/A'}`;

    const message = `Mã OTP của bạn là:\n\n${otp}\n\n${contactInfo}\nSố tiền: ${amountFmt} VNĐ\n\nMã hết hạn sau 5 phút.`;

    if (Platform.OS === 'web') {
      window.alert(`[Xác thực ${action}]\n\n${message}`);
    } else {
      Alert.alert(
        `Xác thực ${action}`,
        message,
        [{ text: 'OK' }],
      );

      // Local notification
      await this.sendLocal({
        title: `🔐 OTP ${action}`,
        body: `Mã xác thực: ${otp} (${amountFmt} VNĐ) – hết hạn sau 5 phút.`,
        data: { type: 'otp', action: type, amount },
      });
    }

    return otp;
  }

  // ─── Promotion Notification ───────────────────────────────────
  async notifyPromotion({ promoTitle, promoDesc }) {
    await this.sendLocal({
      title: `🎁 Ưu đãi mới: ${promoTitle}`,
      body: promoDesc,
      data: { type: 'promotion' },
    });
  }

  // ─── VIP Upgrade Notification ─────────────────────────────────
  async notifyVIPUpgrade(newLevel) {
    await this.sendLocal({
      title: `👑 Chúc mừng! Bạn đã lên VIP ${newLevel}`,
      body: `Hưởng nhiều ưu đãi độc quyền dành riêng cho VIP ${newLevel}: hoàn tiền cao hơn, rút tiền ưu tiên và nhiều hơn nữa!`,
      data: { type: 'vip', level: newLevel },
    });
  }

  // ─── Active User Nudge ────────────────────────────────────────
  async notifyActiveUser() {
    await this.sendLocal({
      title: '🔥 Bạn đang nạp – có khuyến mãi HOT!',
      body: 'Nạp tiền ngay hôm nay để nhận thêm 100% bonus. Ưu tiên VIP xử lý trước!',
      data: { type: 'active_nudge' },
    });
  }

  // ─── Schedule daily promo reminder ───────────────────────────
  async scheduleDailyPromoReminder() {
    if (Platform.OS === 'web') return;
    try {
      // Cancel existing
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Ưu đãi hàng ngày đang chờ bạn!',
          body: 'Đăng nhập ngay để xem các khuyến mãi mới nhất và nhận thưởng VIP mỗi ngày.',
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    } catch (e) {
      console.warn('[Notif] Error scheduling daily reminder:', e);
    }
  }

  // ─── Helper ──────────────────────────────────────────────────
  _generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default new NotificationService();
