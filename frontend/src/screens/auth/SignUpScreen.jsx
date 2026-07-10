/**
 * SignUp Screen
 * Đăng ký với số điện thoại (ưu tiên) hoặc email.
 * Luồng: Nhập thông tin → Gửi OTP xác thực SĐT → Tạo tài khoản
 */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../styles/colors';
import { useAuth } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../config';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NotificationService from '../../services/NotificationService';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ─── OTP Step Modal ────────────────────────────────────────────────────────────
const OTPModal = ({ visible, phone, onVerify, onResend, onClose, loading, demoOTP }) => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);

  const handleVerify = () => {
    if (otp.length !== 6) {
      if (Platform.OS === 'web') {
        window.alert('Lỗi: Mã OTP phải gồm 6 chữ số');
      } else {
        Alert.alert('Lỗi', 'Mã OTP phải gồm 6 chữ số');
      }
      return;
    }
    onVerify(otp);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.iconWrap}>
              <Ionicons name="phone-portrait-outline" size={28} color={COLORS.primary} />
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.title}>Xác thực số điện thoại</Text>
          <Text style={modalStyles.desc}>
            Mã OTP 6 số đã được gửi đến{'\n'}
            <Text style={modalStyles.phone}>{phone}</Text>
          </Text>

          {Platform.OS === 'web' && demoOTP && (
            <Text style={{ color: COLORS.primary, fontSize: 13, fontFamily: 'SpaceGroteskBold', textAlign: 'center', marginBottom: 15 }}>
              Mã OTP Demo: {demoOTP}
            </Text>
          )}

          {/* OTP Input */}
          <TextInput
            ref={inputRef}
            style={modalStyles.otpInput}
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="_ _ _ _ _ _"
            placeholderTextColor={COLORS.inputPlaceholder}
            autoFocus
          />

          <TouchableOpacity
            style={[modalStyles.verifyBtn, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.buttonPrimaryText} />
            ) : (
              <Text style={modalStyles.verifyBtnText}>XÁC NHẬN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.resendBtn} onPress={onResend}>
            <Text style={modalStyles.resendText}>Gửi lại mã OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main SignUp Screen ────────────────────────────────────────────────────────
const SignUp = () => {
  const { login } = useAuth();
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [demoOTP, setDemoOTP] = useState('');

  const pendingOTP = useRef(null);

  // ── Validation ──────────────────────────────────────────────
  const validate = () => {
    if (!username.trim() || username.trim().length < 3) {
      showAlert('Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự');
      return false;
    }
    if (!phone.trim() || !/^(0|\+84)[3-9]\d{8}$/.test(phone.trim())) {
      showAlert('Lỗi', 'Số điện thoại không hợp lệ (VD: 0912345678)');
      return false;
    }
    if (password.length < 6) {
      showAlert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  // ── Gửi OTP xác thực SĐT ────────────────────────────────────
  const handleSendOTP = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // Gửi local notification OTP
      const generatedOTP = await NotificationService.sendOTP('register', { phone }, 0);
      pendingOTP.current = generatedOTP;
      setDemoOTP(generatedOTP);
      setShowOTPModal(true);
    } catch (e) {
      // Fallback
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      pendingOTP.current = otp;
      setDemoOTP(otp);
      if (Platform.OS === 'web') {
        window.alert(`Mã OTP của bạn là: ${otp}\n(Chỉ dùng cho demo)`);
        setShowOTPModal(true);
      } else {
        Alert.alert(
          'Mã OTP xác thực',
          `Mã OTP của bạn là: ${otp}\n(Chỉ dùng cho demo)`,
          [{ text: 'OK', onPress: () => setShowOTPModal(true) }],
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Xác thực OTP + tạo tài khoản ────────────────────────────
  const handleVerifyAndRegister = async (enteredOTP) => {
    if (enteredOTP !== pendingOTP.current) {
      showAlert('Sai OTP', 'Mã xác thực không đúng. Vui lòng thử lại.');
      return;
    }
    setVerifyLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          phone: phone.trim(),
          email: email.trim() || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setShowOTPModal(false);
        // data.data chứa user được trả về từ sendSuccess ở controller
        const userObj = data.data || data;
        login(userObj);
        await NotificationService.notifyPromotion({
          promoTitle: 'Chào mừng tân thủ!',
          promoDesc: 'Xác thực SĐT thành công. Nhận ngay ưu đãi tân thủ $10 miễn phí!',
        });
      } else {
        showAlert('Lỗi', data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (e) {
      // Fallback demo
      setShowOTPModal(false);
      login({
        id: Date.now(),
        username: username.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        vip_level: 0,
        balance: 0,
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const newOTP = await NotificationService.sendOTP('register', { phone }, 0);
      pendingOTP.current = newOTP;
      setDemoOTP(newOTP);
    } catch {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      pendingOTP.current = otp;
      setDemoOTP(otp);
      showAlert('OTP mới', `Mã OTP: ${otp}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../../assets/favicon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>BETGAMING</Text>
            <Text style={styles.brandSub}>Esports Betting Platform</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
              <View>
                <Text style={styles.cardTitle}>ĐĂNG KÝ</Text>
                <Text style={styles.cardSub}>Tạo tài khoản miễn phí</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputInner}
                  placeholder="0912 345 678"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
              <Text style={styles.hint}>Dùng để nhận OTP xác thực & thông báo</Text>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên đăng nhập <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor={COLORS.inputPlaceholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Email (optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (không bắt buộc)</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputInner}
                  placeholder="example@gmail.com"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[styles.inputInner, { flex: 1 }]}
                  placeholder="Ít nhất 6 ký tự"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Xác nhận mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={COLORS.inputPlaceholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Notice */}
            <View style={styles.noticeBox}>
              <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
              <Text style={styles.noticeText}>
                Số điện thoại sẽ được xác thực qua mã OTP. Dùng cho nạp/rút tiền & thông báo ưu đãi.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleSendOTP}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.buttonPrimaryText} />
              ) : (
                <>
                  <Ionicons name="phone-portrait-outline" size={18} color={COLORS.buttonPrimaryText} />
                  <Text style={styles.registerBtnText}>GỬI MÃ XÁC THỰC</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <Text style={styles.footerLink}>Điều khoản sử dụng</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OTPModal
        visible={showOTPModal}
        phone={phone}
        onVerify={handleVerifyAndRegister}
        onResend={handleResendOTP}
        onClose={() => setShowOTPModal(false)}
        loading={verifyLoading}
        demoOTP={demoOTP}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  brandName: {
    color: COLORS.primary,
    fontSize: 26,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 4,
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'Manrope',
    letterSpacing: 1,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 2,
  },
  cardSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Manrope',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'ManropeBold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: 'Manrope',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: 'Manrope',
  },
  eyeBtn: {
    padding: 4,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Manrope',
    marginTop: 4,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.glowSoft,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    marginBottom: 16,
  },
  noticeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Manrope',
    flex: 1,
    lineHeight: 18,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  registerBtnText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 15,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 1.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginPrompt: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Manrope',
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: 'ManropeBold',
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'Manrope',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.modal,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.glowSoft,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Manrope',
    lineHeight: 22,
    marginBottom: 24,
  },
  phone: {
    color: COLORS.primary,
    fontFamily: 'ManropeBold',
  },
  otpInput: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: COLORS.primary,
    fontSize: 28,
    fontFamily: 'ManropeExtraBold',
    textAlign: 'center',
    letterSpacing: 12,
    marginBottom: 20,
  },
  verifyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyBtnText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 16,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 2,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Manrope',
  },
});

export default SignUp;
