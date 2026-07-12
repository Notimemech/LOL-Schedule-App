import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import api from "../../services/api";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const WalletScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const rawUser = await AsyncStorage.getItem('userInfo');
        if (!rawUser) return;
        const user = JSON.parse(rawUser);

        const balanceResponse = await api.get(`/wallet/${user.id}`);
        if (balanceResponse?.data) {
          setCurrentBalance(Number(balanceResponse.data.balance || 0));
        }

        const transactionsResponse = await api.get(`/wallet/transactions/${user.id}`);
        if (transactionsResponse?.data) {
          setTransactions(transactionsResponse.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      }
    };

    loadWalletData();
  }, []);

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!depositAmount || depositAmount < 10000) {
      Alert.alert("Error", "Please enter a valid amount (Minimum 10,000 VNĐ)");
      return;
    }

    setLoading(true);
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) {
        Alert.alert('Error', 'Please sign in first.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(rawUser);
      const response = await api.post('/wallet/create-payment-url', {
        amount: depositAmount,
        userId: user.id,
      });

      const paymentUrlFromServer = response?.data?.paymentUrl || response?.paymentUrl;
      if (paymentUrlFromServer) {
        setPaymentUrl(paymentUrlFromServer);
      } else {
        throw new Error('No payment URL returned from server.');
      }
    } catch (error) {
      Alert.alert("Error", "Cannot create VNPay order at the moment");
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
      if (balanceResponse?.data) {
        setCurrentBalance(Number(balanceResponse.data.balance || 0));
      }

      const transactionsResponse = await api.get(`/wallet/transactions/${user.id}`);
      if (transactionsResponse?.data) {
        setTransactions(transactionsResponse.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    }
  };

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;

    if (url.includes("vnpay-return")) {
      setPaymentUrl(null);

      if (url.includes("vnp_ResponseCode=00")) {
        await refreshWalletData();
        Alert.alert("Success", "You have successfully deposited money into your wallet!");
      } else {
        Alert.alert("Failed", "Transaction was cancelled or an error occurred.");
      }
    }
  };

  // Format số tiền nhập vào cho đẹp (ví dụ: 100,000)
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (text) => {
    const numericValue = text.replace(/\D/g, "");
    setAmount(numericValue ? formatNumber(numericValue) : "");
  };

  // NẾU ĐANG CÓ PAYMENT URL -> HIỂN THỊ WEBVIEW CHIẾM TOÀN MÀN HÌNH
  if (paymentUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark }}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => setPaymentUrl(null)} style={{ padding: 10 }}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.webviewTitle}>Pay with VNPay</Text>
          <View style={{ width: 48 }} /> 
        </View>
        <WebView
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />}
        />
      </SafeAreaView>
    );
  }

  // GIAO DIỆN CHÍNH CỦA MÀN HÌNH NẠP TIỀN
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top up</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          {/* Card Số dư */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>{formatNumber(currentBalance)} VNĐ</Text>
          </View>

          {/* Form nhập số tiền */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Amount to Deposit (VNĐ)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange}
                maxLength={12}
              />
              <Text style={styles.currency}>VNĐ</Text>
            </View>
          </View>

          {/* Gợi ý số tiền nhanh */}
          <Text style={styles.quickSelectLabel}>Quick Select</Text>
          <View style={styles.quickSelectContainer}>
            {QUICK_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.quickSelectBtn,
                  amount === formatNumber(val) && styles.quickSelectBtnActive
                ]}
                onPress={() => setAmount(formatNumber(val))}
              >
                <Text style={[
                  styles.quickSelectText,
                  amount === formatNumber(val) && styles.quickSelectTextActive
                ]}>
                  {formatNumber(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent Transactions</Text>
            {transactions.length === 0 ? (
              <Text style={styles.historyEmpty}>No transaction history yet.</Text>
            ) : (
              transactions.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyType}>{item.type || 'DEPOSIT'}</Text>
                    <Text style={styles.historyTime}>{item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}</Text>
                  </View>
                  <Text style={styles.historyAmount}>
                    {Number(item.amount || 0) > 0 ? '+' : ''}{formatNumber(Number(item.amount || 0))} VNĐ
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Nút Thanh toán */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleDeposit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="wallet" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.submitBtnText}>Pay with VNPay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e", // Phù hợp với màu app LOL
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ManropeBold",
  },
  backBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  balanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  balanceLabel: {
    color: "#aaa",
    fontSize: 14,
    fontFamily: "ManropeMedium",
    marginBottom: 5,
  },
  balanceAmount: {
    color: "#00a8ff", // Hoặc COLORS.primary
    fontSize: 28,
    fontFamily: "SpaceGrotesk-Bold",
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "ManropeMedium",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 24,
    fontFamily: "SpaceGrotesk-Bold",
    paddingVertical: 15,
  },
  currency: {
    color: "#888",
    fontSize: 16,
    fontFamily: "ManropeBold",
  },
  quickSelectLabel: {
    color: "#aaa",
    fontSize: 14,
    fontFamily: "ManropeMedium",
    marginBottom: 10,
  },
  quickSelectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickSelectBtn: {
    width: "31%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  quickSelectBtnActive: {
    backgroundColor: "rgba(0, 168, 255, 0.2)",
    borderColor: "#00a8ff",
  },
  quickSelectText: {
    color: "#ccc",
    fontSize: 14,
    fontFamily: "ManropeBold",
  },
  quickSelectTextActive: {
    color: "#00a8ff",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: "#00a8ff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "ManropeBold",
  },
  webviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#1a1a2e",
  },
  webviewTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "ManropeBold",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  historyCard: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  historyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: "ManropeBold",
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  historyType: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "ManropeBold",
  },
  historyTime: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  historyAmount: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: "ManropeBold",
  },
  historyEmpty: {
    color: COLORS.textMuted,
    fontSize: 13,
  }
});

export default WalletScreen;