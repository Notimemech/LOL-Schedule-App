import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../context/NotificationContext';

// ─── Icon per notification type ───────────────────────────────────
const TYPE_META = {
  deposit:      { icon: 'cash',                color: '#22C55E' },
  withdraw:     { icon: 'wallet',              color: '#F59E0B' },
  bet:          { icon: 'trophy',              color: '#6366F1' },
  bet_cancel:   { icon: 'arrow-undo',          color: '#EF4444' },
  promotion:    { icon: 'gift',                color: '#EC4899' },
  follow_team:  { icon: 'people',              color: '#06B6D4' },
  follow_match: { icon: 'location',            color: '#8B5CF6' },
  vip:          { icon: 'star',                color: '#F59E0B' },
  system:       { icon: 'notifications',       color: '#6B7280' },
};

// ─── Single toast ─────────────────────────────────────────────────
const Toast = ({ noti, onDismiss }) => {
  const { colors: COLORS } = useTheme();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  const meta = TYPE_META[noti.type] || TYPE_META.system;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 160,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 1.5s
    const timer = setTimeout(dismiss, 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: COLORS.card,
          borderColor: COLORS.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <Pressable style={styles.inner} onPress={dismiss} android_ripple={null}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: meta.color }]} />

        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: meta.color + '22' }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: COLORS.text }]} numberOfLines={1}>
            {noti.title}
          </Text>
          <Text style={[styles.message, { color: COLORS.textMuted }]} numberOfLines={2}>
            {noti.message}
          </Text>
        </View>

        {/* Dismiss × */}
        <Pressable onPress={dismiss} hitSlop={12} style={styles.close}>
          <Ionicons name="close" size={16} color={COLORS.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

// ─── Host — renders all queued toasts ────────────────────────────
const ToastHost = () => {
  const { toastQueue, dismissToast } = useNotifications();

  return (
    <View style={styles.host} pointerEvents="box-none">
      {toastQueue.map((noti) => (
        <Toast
          key={noti._toastId}
          noti={noti}
          onDismiss={() => dismissToast(noti._toastId)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toast: {
    width: '92%',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontFamily: 'ManropeBold',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    fontFamily: 'Manrope',
    lineHeight: 16,
  },
  close: {
    padding: 4,
  },
});

export default ToastHost;
