import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import api from "../../services/api";
import ContentHeader from "../../components/common/ContentHeader";
import { formatMoney } from "../../utils/format";
import QuickAmountSelector from "../../components/ui/QuickAmountSelector";
import TransactionItem from "../../components/wallet/TransactionItem";
import CustomAlert from "../../components/common/CustomAlert";
import { walletStyles as styles } from "../../styles/wallet.styles";
import SectionHeader from "../../components/ui/SectionHeader";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const WalletScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const promotion = route.params?.promotion || null;
  const [amount, setAmount] = useState("");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

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

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) return;
      const user = JSON.parse(rawUser);

      const balanceResponse = await api.get(`/wallet/${user.id}`);
      const walletData = balanceResponse?.data ?? balanceResponse;
      if (walletData) setCurrentBalance(Number(walletData.balance || 0));

      const transactionsResponse = await api.get(`/wallet/transactions/${user.id}`);
      const transactionsData = transactionsResponse?.data ?? transactionsResponse;
      if (Array.isArray(transactionsData)) {
        setTransactions(transactionsData.slice(0, 5));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const calculateBonus = () => {
    if (!promotion || !amount) return 0;
    const deposit = parseInt(amount.replace(/\D/g, ""), 10) || 0;
    const bonusPercent = Number(promotion.bonus_percentage) || 0;
    let bonus = (deposit * bonusPercent) / 100;
    const maxBonus = Number(promotion.max_bonus) || 0;
    if (maxBonus > 0 && bonus > maxBonus) bonus = maxBonus;
    return bonus;
  };

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (!depositAmount || depositAmount < 10000) {
      showAlert("Error", "Please enter a valid amount (Minimum 10,000 VNĐ)", true);
      return;
    }
    setLoading(true);
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) { showAlert('Error', 'Please sign in first.', true); setLoading(false); return; }
      const user = JSON.parse(rawUser);
      const payload = { amount: depositAmount, userId: user.id };
      if (promotion) payload.promotionId = promotion.id;

      const response = await api.post('/wallet/create-payment-url', payload);
      const paymentUrlFromServer = response?.paymentUrl || response?.data?.paymentUrl;
      if (paymentUrlFromServer) {
        setPaymentUrl(paymentUrlFromServer);
      } else {
        throw new Error('No payment URL returned from server.');
      }
    } catch (error) {
      showAlert("Error", "Cannot create VNPay order at the moment", true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) return;
      const user = JSON.parse(rawUser);
      const balanceResponse = await api.get(`/wallet/${user.id}`);
      const walletData = balanceResponse?.data ?? balanceResponse;
      if (walletData) setCurrentBalance(Number(walletData.balance || 0));
      const transactionsResponse = await api.get(`/wallet/transactions/${user.id}`);
      const transactionsData = transactionsResponse?.data ?? transactionsResponse;
      if (Array.isArray(transactionsData)) setTransactions(transactionsData.slice(0, 5));
      else setTransactions([]);
      DeviceEventEmitter.emit('wallet:transactions-updated');
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    }
  };

  const handleNavigationStateChange = async (navState) => {
    // We let the backend process the return URL and respond with an HTML page
    // that sends a postMessage to handleWebViewMessage.
    // So we don't intercept 'vnpay-return' here anymore.
  };

  const handleWebViewMessage = async (event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload?.status === 'success') {
        setPaymentUrl(null);
        await refreshWalletData();
        showAlert('Success', 'You have successfully deposited money into your wallet!', false);
      } else {
        setPaymentUrl(null);
        showAlert('Failed', 'Transaction did not complete successfully. Please try again.', true);
      }
    } catch (error) {
      console.warn('Unable to parse WebView message:', error);
    }
  };

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const handleAmountChange = (text) => {
    const numericValue = text.replace(/\D/g, "");
    setAmount(numericValue ? formatMoney(numericValue) : "");
  };

  // WebView screen
  if (paymentUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 10, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          <TouchableOpacity onPress={() => setPaymentUrl(null)} style={{ padding: 10 }}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ color: COLORS.text, fontSize: 18, fontFamily: "ManropeBold" }}>Pay with VNPay</Text>
          <View style={{ width: 48 }} />
        </View>
        <WebView
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleWebViewMessage}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />}
        />
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          isError={alertConfig.isError}
          onConfirm={alertConfig.onConfirm}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ContentHeader title="TOP UP" showBack={true} />

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Active Promotion Banner */}
            {promotion && (
              <View style={styles.infoBox}>
                <Ionicons name="gift" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  <Text style={{ fontFamily: "SpaceGroteskBold", color: COLORS.text }}>{promotion.title}</Text>{"\n"}
                  Applying for this deposit!
                </Text>
              </View>
            )}

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.walletIconBox}>
                <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
              <Text style={styles.balanceAmount}>{formatMoney(currentBalance)}</Text>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AMOUNT TO DEPOSIT (VNĐ)</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefix}>₫</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={handleAmountChange}
                  maxLength={12}
                />
              </View>
            </View>

            {/* Quick Select */}
            <SectionHeader title="QUICK SELECT" />
            <QuickAmountSelector 
              amounts={QUICK_AMOUNTS}
              selectedAmount={amount}
              onSelect={(val) => setAmount(formatMoney(val))}
            />

            {/* Receipt Box */}
            {promotion && amount && parseInt(amount.replace(/\D/g, ""), 10) > 0 ? (
              <View style={{ backgroundColor: COLORS.card, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 14, fontFamily: "ManropeMedium" }}>Deposit Amount:</Text>
                  <Text style={{ color: COLORS.text, fontSize: 14, fontFamily: "ManropeBold" }}>{formatMoney(parseInt(amount.replace(/\D/g, ""), 10))} VNĐ</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 14, fontFamily: "ManropeMedium" }}>Promotion Bonus:</Text>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontFamily: "ManropeBold" }}>+ {formatMoney(calculateBonus())} VNĐ</Text>
                </View>
                <View style={{ height: 1, backgroundColor: COLORS.divider, marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: COLORS.text, fontSize: 15, fontFamily: "ManropeBold" }}>Total Wallet Value:</Text>
                  <Text style={{ color: COLORS.warning, fontSize: 17, fontFamily: "SpaceGroteskBold" }}>{formatMoney(parseInt(amount.replace(/\D/g, ""), 10) + calculateBonus())} VNĐ</Text>
                </View>
              </View>
            ) : null}

          </ScrollView>

          {/* Submit Button */}
          <View style={styles.bottomFixedBox}>
            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handleDeposit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Ionicons name="wallet" size={20} color={COLORS.background} />
                  <Text style={styles.payButtonText}>TOP UP WITH VNPAY</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
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

export default WalletScreen;
