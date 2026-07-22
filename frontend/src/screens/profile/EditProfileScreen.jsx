import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useThemedStyles } from '../../hooks/useTheme';
import CustomAlert from '../../components/common/CustomAlert';
import {
  getUserById,
  updateUserProfile,
  deleteUserAccount,
  getStoredUserId,
} from '../../services/userService';

// ─── Field wrapper ────────────────────────────────────────────────
const Field = ({ label, children, style: s }) => (
  <View style={s.fieldGroup}>
    <Text style={s.fieldLabel}>{label}</Text>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────
const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(makeStyles);

  const emailRef = useRef(null);

  // Form state — only 3 fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    isError: false,
    onConfirm: () => { },
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'CANCEL',
  });

  const showAlert = (
    title,
    message,
    isError = false,
    onConfirm = null,
    onCancel = null,
    confirmText = 'OK',
    cancelText = 'CANCEL',
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      isError,
      onConfirm: onConfirm || hideAlert,
      onCancel,
      confirmText,
      cancelText,
    });
  };
  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  // ── Load existing profile ─────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const id = await getStoredUserId();
          if (!id || !mounted) return;
          setUserId(id);
          const user = await getUserById(id);
          if (!mounted) return;
          setFullName(user.username || '');
          setPhoneNumber(user.phone || '');
          setEmail(user.email || '');
        } catch (_) {
          // Fail silently — user can still fill in manually
        }
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

  // ── Update ────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!fullName.trim()) {
      showAlert('Validation', 'Username is required.', true);
      return;
    }

    // Usernames double as login identifiers and friend handles (username#TAG).
    if (/\s/.test(fullName.trim())) {
      showAlert('Validation', 'Username cannot contain spaces.', true);
      return;
    }

    setLoading(true);
    try {
      // The display name IS the `username` column — there is no full_name in DB.
      const payload = {
        username: fullName.trim(),
        phone: phoneNumber.trim() || undefined,
      };
      const updated = await updateUserProfile(userId, payload);

      // Sync the cache from what the server actually saved.
      const raw = await AsyncStorage.getItem('userInfo');
      if (raw) {
        const parsed = JSON.parse(raw);
        await AsyncStorage.setItem(
          'userInfo',
          JSON.stringify({
            ...parsed,
            username: updated?.username ?? fullName.trim(),
            phone: updated?.phone ?? parsed.phone,
            tag: updated?.tag ?? parsed.tag,
          }),
        );
      }

      showAlert('Success', 'Profile updated successfully!', false, () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (err) {
      showAlert(
        'Error',
        err?.response?.data?.message || 'Failed to update profile. Please try again.',
        true,
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────
  const handleDeleteAccount = () => {
    showAlert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      true,
      async () => {
        try {
          await deleteUserAccount(userId);
          await AsyncStorage.multiRemove(['userInfo', 'token', 'accessToken']);
          hideAlert();
          navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        } catch (_) {
          showAlert('Error', 'Failed to delete account. Please try again.', true);
        }
      },
      hideAlert,
      'DELETE',
      'CANCEL',
    );
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* KeyboardAvoidingView pushes content above the keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          style={s.body}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={s.avatarContainer}>
            <View style={s.avatarCircle}>
              <Ionicons name="person" size={52} color={COLORS.primary} />
            </View>
          </View>

          {/* Username (login identifier + friend handle) */}
          <Field label="Username" style={s}>
            <TextInput
              style={[s.inputBox, s.inputText]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter username (no spaces)"
              placeholderTextColor={s.inputPlaceholder.color}
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              accessibilityLabel="Username"
            />
          </Field>

          {/* Phone number — editable */}
          <Field label="Phone number" style={s}>
            <TextInput
              ref={emailRef}
              style={[s.inputBox, s.inputText]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              placeholderTextColor={s.inputPlaceholder.color}
              keyboardType="phone-pad"
              returnKeyType="done"
              accessibilityLabel="Phone number"
            />
          </Field>

          {/* Email — read-only */}
          <Field label="Email" style={s}>
            <View style={[s.inputBox, s.inputDisabled]}>
              <Text style={[s.inputText, !email && s.inputPlaceholder]}>
                {email || 'No email linked'}
              </Text>
              <Icon name="lock" size={13} color={s.inputPlaceholder.color} />
            </View>
          </Field>

          {/* Update button */}
          <TouchableOpacity
            style={[s.updateBtn, loading && s.updateBtnDisabled]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Update profile"
          >
            <Text style={s.updateBtnText}>{loading ? 'Updating…' : 'Update'}</Text>
          </TouchableOpacity>

          {/* Delete account */}
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Text style={s.deleteBtnText}>Delete account</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        isError={alertConfig.isError}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const makeStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider || COLORS.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    headerTitle: {
      color: COLORS.text,
      fontSize: 18,
      fontFamily: 'ManropeBold',
    },

    // Body
    body: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
    },

    // Avatar
    avatarContainer: {
      alignSelf: 'center',
      marginBottom: 36,
      position: 'relative',
    },
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: COLORS.primary + '20',
      borderWidth: 2,
      borderColor: COLORS.primary + '60',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.background,
    },

    // Field
    fieldGroup: {
      marginBottom: 24,
    },
    fieldLabel: {
      color: COLORS.text,
      fontSize: 14,
      fontFamily: 'ManropeBold',
      marginBottom: 8,
    },

    // Input — underline style (matching reference)
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingVertical: 11,
      paddingHorizontal: 2,
      backgroundColor: 'transparent',
    },
    inputText: {
      color: COLORS.text,
      fontSize: 15,
      fontFamily: 'Manrope',
      flex: 1,
    },
    inputPlaceholder: {
      color: COLORS.textMuted,
    },
    // Phone read-only: filled background pill
    inputDisabled: {
      backgroundColor: COLORS.backgroundTertiary || COLORS.surface,
      borderRadius: 10,
      borderBottomWidth: 0,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },

    // Update button
    updateBtn: {
      backgroundColor: COLORS.primary,
      borderRadius: 32,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
      elevation: 4,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    updateBtnDisabled: {
      opacity: 0.55,
    },
    updateBtnText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'ManropeBold',
    },

    // Delete account link
    deleteBtn: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    deleteBtnText: {
      color: COLORS.buttonDanger || '#EF4444',
      fontSize: 14,
      fontFamily: 'ManropeBold',
    },
  });

export default EditProfileScreen;
