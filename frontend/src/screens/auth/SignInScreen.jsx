import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import authStyles from '../../styles/auth.styles';
import { registerUser, loginUser } from '../../services/authService';
import CustomAlert from '../../components/common/CustomAlert';

const SignInScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    isError: false,
    onConfirm: () => { },
  });

  const showAlert = (title, message, isError = false, onConfirm = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      isError,
      onConfirm: onConfirm || (() => hideAlert()),
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      showAlert('Missing information', 'Please fill in username, email and password.', true);
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      showAlert('Success', response?.message || 'Account created successfully.', false);
      setIsLogin(true);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed.';
      showAlert('Registration failed', message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      showAlert('Missing information', 'Please fill in email and password.', true);
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      const { token, user } = response?.data || {};
      if (token) {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      }

      showAlert('Success', response?.message || 'Login successful.', false, () => {
        hideAlert();
        navigation.navigate('MainTabs');
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed.';
      showAlert('Login failed', message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={authStyles.content} keyboardShouldPersistTaps="handled">
          <View style={authStyles.card}>
            <Text style={authStyles.title}>{isLogin ? 'Sign in' : 'Create account'}</Text>
            <Text style={authStyles.subtitle}>
              {isLogin ? 'Welcome back. Sign in to continue your betting journey.' : 'Join the app and start exploring esports betting.'}
            </Text>

            {!isLogin && (
              <>
                <Text style={authStyles.inputLabel}>Username</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter username"
                  placeholderTextColor="#6E7A85"
                  value={form.username}
                  onChangeText={(value) => handleChange('username', value)}
                />
              </>
            )}

            <Text style={authStyles.inputLabel}>Email</Text>
            <TextInput
              style={authStyles.input}
              placeholder="Enter email"
              placeholderTextColor="#6E7A85"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(value) => handleChange('email', value)}
            />

            {!isLogin && (
              <>
                <Text style={authStyles.inputLabel}>Phone</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter phone"
                  placeholderTextColor="#6E7A85"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                />
              </>
            )}

            <Text style={authStyles.inputLabel}>Password</Text>
            <TextInput
              style={authStyles.input}
              placeholder="Enter password"
              placeholderTextColor="#6E7A85"
              secureTextEntry
              value={form.password}
              onChangeText={(value) => handleChange('password', value)}
            />

            <TouchableOpacity
              style={authStyles.button}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? (isLogin ? 'Signing in...' : 'Creating...') : (isLogin ? 'Sign in' : 'Create account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.secondaryButton} onPress={() => setIsLogin((prev) => !prev)}>
              <Text style={authStyles.secondaryButtonText}>
                {isLogin ? 'Need an account? Create one' : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        isError={alertConfig.isError}
        onConfirm={alertConfig.onConfirm}
      />
    </SafeAreaView>
  );
};

export default SignInScreen;