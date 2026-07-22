import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import api from "../../services/api";
import ContentHeader from "../../components/common/ContentHeader";
import { formatMoney } from "../../utils/format";
import QuickAmountSelector from "../../components/ui/QuickAmountSelector";
import SectionHeader from "../../components/ui/SectionHeader";
import CustomAlert from "../../components/common/CustomAlert";
import { makeWalletStyles } from "../../styles/wallet.styles";

const QUICK_WITHDRAW = [50000, 100000, 200000, 500000, 1000000];

const WithdrawScreen = () => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeWalletStyles);
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState(null);

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

  React.useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) return;
      const user = JSON.parse(rawUser);
      const userId = user?.id || user?.userId || user?.user_id || user?.user?.id;
      if (!userId) return;
      const response = await api.get(`/wallet/${userId}`);
      const walletData = response?.data ?? response;
      if (walletData) setCurrentBalance(Number(walletData.balance || 0));
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const MAX_WITHDRAW = 10_000_000;

  const handleAmountChange = (text) => {
    const numericOnly = text.replace(/\D/g, "");
    const numericValue = parseInt(numericOnly || "0", 10);
    if (numericValue > MAX_WITHDRAW) return; // cap at 10,000,000 VNĐ
    setAmount(numericOnly ? formatMoney(numericOnly) : "");
  };

  const handleRequestWithdraw = async () => {
    const withdrawAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!withdrawAmount || withdrawAmount < 50000) {
      showAlert("Error", "Minimum withdrawal amount is 50,000 VNĐ", true);
      return;
    }
    if (withdrawAmount > MAX_WITHDRAW) {
      showAlert("Error", "Maximum withdrawal amount is 10,000,000 VNĐ", true);
      return;
    }
    if (withdrawAmount > currentBalance) {
      showAlert("Error", "Insufficient balance to complete this transaction", true);
      return;
    }

    setLoading(true);
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) { showAlert('Error', 'Please sign in first.', true); setLoading(false); return; }
      const user = JSON.parse(rawUser);
      const userId = user?.id || user?.userId || user?.user_id || user?.user?.id;

      const response = await api.post('/wallet/withdraw-vnpay', {
        userId: userId,
        amount: withdrawAmount,
      });

      const url = response?.paymentUrl || response?.data?.paymentUrl;
      if (url) {
        setPaymentUrl(url);
      } else {
        throw new Error('No payment URL returned from server.');
      }
    } catch (error) {
      showAlert('Error', error?.response?.data?.message || 'Unable to process withdrawal. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      setPaymentUrl(null);

      if (payload?.status === 'withdraw_success') {
        await loadBalance();
        DeviceEventEmitter.emit('wallet:transactions-updated');
        showAlert("Success", `Successfully withdrawn ${formatMoney(payload.amount)} VNĐ from your wallet.`, false, () => {
          hideAlert();
          navigation.goBack();
        });
      } else {
        showAlert('Failed', 'Transaction was cancelled or failed. Please try again.', true);
      }
    } catch (error) {
      console.warn('Unable to parse WebView message:', error);
    }
  };

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (url.includes("vnpay-withdraw-return")) {
      if (url.includes("vnp_ResponseCode=00")) {
        // Handled by postMessage from WebView HTML
      } else {
        setPaymentUrl(null);
        showAlert("Failed", "Transaction was cancelled or an error occurred.", true);
      }
    }
  };

  // WebView screen for VNPay
  if (paymentUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => setPaymentUrl(null)} style={{ padding: 10 }}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.webviewTitle}>Confirm Withdrawal</Text>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Tapping outside input dismisses the keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <ContentHeader title="WITHDRAW" showBack={true} />

            <ScrollView
              style={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Balance Card */}
              <View style={styles.balanceCard}>
                <Icon name="money-bill-transfer" size={28} color={COLORS.danger} style={{ marginBottom: 8 }} />
                <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
                <Text style={styles.balanceAmount}>{formatMoney(currentBalance)} VNĐ</Text>
              </View>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.inputLabel}>AMOUNT TO WITHDRAW (VNĐ)</Text>
                  <TouchableOpacity onPress={() => setAmount(formatMoney(currentBalance))} style={styles.withdrawAllBtn}>
                    <Text style={styles.withdrawAllText}>WITHDRAW ALL</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputPrefixWithdraw}>₫</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.inputPlaceholder}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={handleAmountChange}
                  // maxLength intentionally removed — enforced in handleAmountChange on raw digits
                  />
                </View>
                {parseInt(amount.replace(/\D/g, "") || 0, 10) > currentBalance && (
                  <Text style={{ color: COLORS.danger, fontSize: 13, marginTop: 8, fontFamily: "Manrope" }}>
                    Amount exceeds your available balance
                  </Text>
                )}
              </View>

              {/* Quick Select */}
              <SectionHeader title="QUICK SELECT" />
              <QuickAmountSelector
                amounts={QUICK_WITHDRAW}
                selectedAmount={amount}
                onSelect={(val) => setAmount(formatMoney(val))}
                activeColor={COLORS.danger}
                maxAmount={currentBalance}
              />

            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        {/* Submit Button — outside ScrollView so it stays fixed at bottom */}
        <View style={styles.bottomFixedBox}>
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              loading && styles.payButtonDisabled
            ]}
            onPress={handleRequestWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.staticWhite} />
            ) : (
              <>
                <Icon name="building-columns" size={18} color={COLORS.staticWhite} />
                <Text style={styles.payButtonText}>WITHDRAW VIA VNPAY</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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


export default WithdrawScreen;