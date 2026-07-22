import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import api from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import { getVipColors } from '../../styles/themes';
import CustomAlert from '../../components/common/CustomAlert';

const VipScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    isError: false,
    onConfirm: () => { },
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'CANCEL'
  });

  const showAlert = (title, message, isError = false, onConfirm = null, onCancel = null, confirmText = 'OK', cancelText = 'CANCEL') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      isError,
      onConfirm: onConfirm || (() => hideAlert()),
      onCancel,
      confirmText,
      cancelText
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem('userInfo');
      if (!raw) {
        setLoading(false);
        return;
      }
      const userId = JSON.parse(raw).id;
      const [tiersRes, statusRes] = await Promise.all([
        api.get('/vip/tiers'),
        api.get(`/vip/status/${userId}`)
      ]);
      setTiers(tiersRes.data || []);
      setStatus(statusRes.data || null);
    } catch (e) {
      console.error(e);
      showAlert('Error', 'Unable to load VIP data', true);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (tier) => {
    showAlert(
      'Confirm Purchase',
      `Are you sure you want to subscribe to ${tier.name} for ${Number(tier.price_per_month).toLocaleString('en-US')} VND/month? The amount will be deducted from your wallet.`,
      false,
      async () => {
        try {
          setLoading(true);
          const raw = await AsyncStorage.getItem('userInfo');
          if (!raw) return;
          const userId = JSON.parse(raw).id;
          const res = await api.post('/vip/buy', { userId, tierId: tier.id });
          showAlert('Success', res.message, false, () => {
            hideAlert();
            fetchData();
          });
        } catch (e) {
          showAlert('Error', e.response?.data?.message || 'Something went wrong while purchasing VIP', true);
          setLoading(false);
        }
      },
      () => hideAlert(),
      'SUBSCRIBE',
      'CANCEL'
    );
  };

  const handleCancelRenew = () => {
    showAlert(
      'Cancel Auto-Renewal',
      'Are you sure you want to cancel the auto-renewal of your VIP subscription?',
      false,
      async () => {
        try {
          setLoading(true);
          const raw = await AsyncStorage.getItem('userInfo');
          if (!raw) return;
          const userId = JSON.parse(raw).id;
          const res = await api.post('/vip/cancel-renew', { userId });
          showAlert('Success', res.message, false, () => {
            hideAlert();
            fetchData();
          });
        } catch (e) {
          showAlert('Error', e.response?.data?.message || 'Something went wrong', true);
          setLoading(false);
        }
      },
      () => hideAlert(),
      'YES, CANCEL',
      'NO'
    );
  };

  // Shared VIP palette — same source as profile & bet history badges.
  const getTierColors = (name) => getVipColors(name);

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    backBtn: { marginRight: 15 },
    headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    statusCard: { backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.primary },
    statusTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    statusText: { color: COLORS.textMuted, fontSize: 14 },
    tierCard: { padding: 20, borderRadius: 16 },
    tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    tierName: { fontSize: 24, fontWeight: '900', textTransform: 'uppercase' },
    tierPrice: { fontSize: 18, fontWeight: 'bold' },
    tierBenefit: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    benefitText: { fontSize: 14, marginLeft: 10, fontWeight: '500' },
    buyBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
    buyBtnText: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP Upgrade</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {status && status.vip_tier_id && (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Current Tier: {status.vip_name}</Text>
                <Text style={styles.statusText}>Cashback: {status.bet_cashback_percent}% for bets > {Number(status.min_bet_for_cashback).toLocaleString('en-US')} VND</Text>
                <Text style={styles.statusText}>Expires on: {new Date(status.vip_expires_at).toLocaleDateString('en-US')}</Text>
                
                {status.is_vip_auto_renew ? (
                  <TouchableOpacity style={{ marginTop: 10, padding: 10, backgroundColor: COLORS.badgeDangerBg, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger }} onPress={handleCancelRenew}>
                    <Text style={{ color: COLORS.danger, fontWeight: 'bold' }}>Cancel Auto-Renewal</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: COLORS.textMuted, marginTop: 10, fontStyle: 'italic' }}>Auto-renewal is disabled.</Text>
                )}
              </View>
            )}

            {tiers.map(tier => (
              <View key={tier.id} style={{ marginBottom: 25, position: 'relative' }}>
                <Animated.View style={{ 
                  ...StyleSheet.absoluteFillObject, 
                  backgroundColor: getTierColors(tier.name)[0], 
                  borderRadius: 18, 
                  opacity: opacityAnim,
                  transform: [{ scale: 1.03 }],
                  shadowColor: getTierColors(tier.name)[0],
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 15,
                  elevation: 10
                }} />
                
                <LinearGradient 
                  colors={getTierColors(tier.name)} 
                  start={[0, 0]} end={[1, 1]} 
                  style={{ padding: 2, borderRadius: 18 }}
                >
                  <View style={{ backgroundColor: COLORS.staticBlack, padding: 20, borderRadius: 16 }}>
                    <View style={styles.tierHeader}>
                      <Text style={[styles.tierName, { color: getTierColors(tier.name)[0] }]}>{tier.name}</Text>
                      <Text style={[styles.tierPrice, { color: COLORS.staticWhite }]}>{Number(tier.price_per_month).toLocaleString('en-US')} VND/m</Text>
                    </View>
                    
                    <View style={styles.tierBenefit}>
                      <Icon name="gift-outline" size={22} color={COLORS.staticWhite} />
                      <Text style={[styles.benefitText, { color: COLORS.staticWhite }]}>Get {tier.deposit_bonus_percent}% bonus on next deposit</Text>
                    </View>
                    
                    <View style={styles.tierBenefit}>
                      <Icon name="cash-refund" size={22} color={COLORS.staticWhite} />
                      <Text style={[styles.benefitText, { color: COLORS.staticWhite }]}>{tier.bet_cashback_percent}% cashback on bets > {Number(tier.min_bet_for_cashback).toLocaleString('en-US')} VND</Text>
                    </View>

                    <View style={styles.tierBenefit}>
                      <Icon name="shield-star-outline" size={22} color={getTierColors(tier.name)[0]} />
                      <Text style={[styles.benefitText, { color: COLORS.staticWhite }]}>Receive Exclusive Badge:</Text>
                      <LinearGradient
                          colors={getTierColors(tier.name)}
                          start={[0, 0]} end={[1, 1]}
                          style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
                      >
                          <Icon name="crown" size={12} color={COLORS.staticWhite} />
                          <Text style={{ color: COLORS.staticWhite, fontSize: 11, fontWeight: 'bold', marginLeft: 3 }}>
                            {tier.name}
                          </Text>
                      </LinearGradient>
                    </View>

                    <TouchableOpacity style={[styles.buyBtn, { backgroundColor: getTierColors(tier.name)[0] }]} onPress={() => handleBuy(tier)}>
                      <Text style={[styles.buyBtnText, { color: COLORS.staticBlack }]}>Up to VIP</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </>
        )}
      </ScrollView>

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

export default VipScreen;
