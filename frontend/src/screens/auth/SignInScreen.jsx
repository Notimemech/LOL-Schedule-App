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
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../styles/colors';
import { useAuth } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../config';
import { useNavigation } from '@react-navigation/native';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const SignIn = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }), // Backend login handles email/username/phone in first param
      });
      const data = await res.json();
      if (res.ok) {
        // data.data contains { user, token }
        const loginData = data.data || data;
        login(loginData.user || loginData);
      } else {
        showAlert('Đăng nhập thất bại', data.message || data.error || 'Sai tài khoản hoặc mật khẩu');
      }
    } catch (e) {
      // Fallback demo login for development
      if (username === 'admin' && password === '123456') {
        login({ id: 1, username: 'admin', role_id: 1, vip_level: 10, balance: 1000000 });
      } else {
        showAlert('Lỗi', 'Không thể kết nối server. Dùng admin/123456 để demo.');
      }
    } finally {
      setLoading(false);
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
          {/* Logo / Branding */}
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
            <Text style={styles.cardTitle}>ĐĂNG NHẬP</Text>
            <Text style={styles.cardSub}>Chào mừng trở lại!</Text>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tài khoản / SĐT / Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập, SĐT hoặc Email"
                placeholderTextColor={COLORS.inputPlaceholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.inputPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.buttonPrimaryText} />
              ) : (
                <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Signup link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoBox}>
              <Text style={styles.demoText}>Demo: admin / 123456</Text>
            </View>
          </View>

          <Text style={styles.footer}>
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Text style={styles.footerLink}>Điều khoản sử dụng</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  brandName: {
    color: COLORS.primary,
    fontSize: 28,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 4,
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 13,
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
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  cardSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Manrope',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'ManropeBold',
    marginBottom: 6,
    letterSpacing: 0.5,
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
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 16,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Manrope',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupPrompt: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Manrope',
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: 'ManropeBold',
  },
  demoBox: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  demoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Manrope',
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

export default SignIn;