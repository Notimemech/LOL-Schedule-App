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
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
// Nhớ import instance api của bạn, ví dụ:
// import api from "../../services/api"; 

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const WalletScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // TODO: Fetch số dư thật từ backend. Tạm thời để số giả lập.
  const currentBalance = 1000000; 

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!depositAmount || depositAmount < 10000) {
      Alert.alert("Error", "Please enter a valid amount (Minimum 10,000 VNĐ)");
      return;
    }

    setLoading(true);
    try {
      // TODO: Thay thế bằng API thực tế của bạn
      // const response = await api.post('/wallet/create-payment-url', { amount: depositAmount });
      // if (response.data && response.data.data && response.data.data.paymentUrl) {
      //   setPaymentUrl(response.data.data.paymentUrl);
      // }
      
      // LOGIC GIẢ LẬP ĐỂ TEST UI (Xóa khi có API thật)
      console.log("Call the API to generate a URL with the amount:", depositAmount);
      setTimeout(() => {
        setPaymentUrl("https://sandbox.vnpayment.vn/tryitnow"); // Link giả để test
        setLoading(false);
      }, 1000);

    } catch (error) {
      Alert.alert("Error", "Cannot create VNPay order at the moment");
      console.error(error);
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    // Lắng nghe URL trả về từ VNPay
    if (url.includes("vnpay-return")) {
      setPaymentUrl(null); // Đóng WebView
      
      if (url.includes("vnp_ResponseCode=00")) {
        Alert.alert("Success", "You have successfully deposited money into your wallet!", [
          { 
            text: "OK", 
            onPress: () => {
              // TODO: Gọi API refresh số dư ví ở đây
              navigation.goBack(); 
            }
          }
        ]);
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
  }
});

export default WalletScreen;