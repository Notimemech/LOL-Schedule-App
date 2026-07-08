import React, { useState } from "react";
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
// import api from "../../services/api"; // Import API instance của bạn

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State quản lý OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // TODO: Fetch số dư thực tế từ backend. Tạm thời để số giả lập.
  const currentBalance = 1100000; 

  // Format số tiền (vd: 1000000 -> 1,000,000)
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (text) => {
    const numericValue = text.replace(/\D/g, "");
    setAmount(numericValue ? formatNumber(numericValue) : "");
  };

  // Bước 1: Yêu cầu rút tiền (Kiểm tra số dư và bật form OTP)
  const handleRequestWithdraw = () => {
    const withdrawAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!withdrawAmount || withdrawAmount < 50000) {
      Alert.alert("Error", "The minimum withdrawal amount is 50,000 VNĐ");
      return;
    }

    if (withdrawAmount > currentBalance) {
      Alert.alert("Error", "Insufficient balance to complete the transaction");
      return;
    }

    setLoading(true);
    // GIẢ LẬP GỌI API GỬI OTP (Thực tế bạn sẽ gọi API request-otp ở đây)
    setTimeout(() => {
      setLoading(false);
      setShowOtpModal(true); // Mở form nhập OTP
      Alert.alert("Notification", "OTP code has been sent to your phone number.");
    }, 1000);
  };

  // Bước 2: Xác nhận OTP và Thực hiện Rút tiền (Gọi DB)
  const handleVerifyAndWithdraw = async () => {
    if (otpCode.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP code");
      return;
    }

    setVerifying(true);
    const withdrawAmount = parseInt(amount.replace(/\D/g, ""), 10);

    try {
      // TODO: Uncomment đoạn code dưới đây khi ghép API thật
      /*
      const userId = 2; // Lấy từ Auth Context
      const response = await api.post('/wallet/withdraw', {
        userId: userId,
        amount: withdrawAmount,
        otp: otpCode // Nếu backend của bạn có check OTP
      });
      */

      // GIẢ LẬP KẾT QUẢ TỪ BACKEND
      setTimeout(() => {
        setVerifying(false);
        setShowOtpModal(false);
        setOtpCode(""); // Reset form

        Alert.alert("Success", `You have successfully withdrawn ${formatNumber(withdrawAmount)} VNĐ to your bank account.`, [
          { text: "Great", onPress: () => navigation.goBack() }
        ]);
      }, 1500);

    } catch (error) {
      console.error(error);
      setVerifying(false);
      Alert.alert("Error", "Transaction failed or incorrect OTP code.");
    }
  };

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
          <Text style={styles.headerTitle}>Withdraw Money</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          {/* Card Số dư */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
            <Text style={styles.balanceAmount}>{formatNumber(currentBalance)} VNĐ</Text>
          </View>

          {/* Form nhập số tiền */}
          <View style={styles.inputSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.inputLabel}>Amount to Withdraw (VNĐ)</Text>
              <TouchableOpacity onPress={() => setAmount(formatNumber(currentBalance))}>
                <Text style={styles.withdrawAllText}>Withdraw All</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.noteText}>* Processing time for transactions is 5 - 15 minutes</Text>
          </View>
        </View>

        {/* Nút Rút tiền */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleRequestWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="building-columns" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.submitBtnText}>Request Withdrawal</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* MODAL NHẬP OTP */}
        <Modal
          visible={showOtpModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Verify OTP</Text>
                <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Please enter the 6-digit OTP code sent to your device to confirm the withdrawal of {amount} VNĐ.
              </Text>

              <TextInput
                style={styles.otpInput}
                placeholder="Nhập mã OTP (VD: 123456)"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
                secureTextEntry={true} // Che mã OTP
              />

              <TouchableOpacity 
                style={[styles.verifyBtn, verifying && { opacity: 0.7 }]} 
                onPress={handleVerifyAndWithdraw}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify & Withdraw</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
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
    backgroundColor: "rgba(232, 65, 24, 0.1)", // Đỏ cam nhạt cho Rút tiền
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(232, 65, 24, 0.3)",
  },
  balanceLabel: {
    color: "#aaa",
    fontSize: 14,
    fontFamily: "ManropeMedium",
    marginBottom: 5,
  },
  balanceAmount: {
    color: "#e84118", // Đỏ cam
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
  withdrawAllText: {
    color: "#00a8ff",
    fontSize: 14,
    fontFamily: "ManropeBold",
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
  noteText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 10,
    fontFamily: "ManropeRegular",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: "#e84118", // Màu đỏ thể hiện việc trừ tiền
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
  // Style cho Modal OTP
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e1e36",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ManropeBold",
  },
  modalDesc: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "ManropeRegular",
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 20,
    padding: 15,
    textAlign: "center",
    letterSpacing: 5,
    fontFamily: "SpaceGrotesk-Bold",
    marginBottom: 20,
  },
  verifyBtn: {
    backgroundColor: "#00a8ff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "ManropeBold",
  }
});

export default WithdrawScreen;