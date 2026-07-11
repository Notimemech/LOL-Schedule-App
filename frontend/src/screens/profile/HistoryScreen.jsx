import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import COLORS from "../../styles/colors";
// import api from "../../services/api"; // Import API instance của bạn

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // TODO: Thay bằng ID user thực tế từ Auth Context hoặc AsyncStorage
  const userId = 2; 

  const fetchTransactions = async () => {
    try {
      // TODO: Uncomment đoạn code dưới đây khi đã kết nối API thật
      /*
      const response = await api.get(`/wallet/transactions/${userId}`);
      if (response.data && response.data.data) {
        setTransactions(response.data.data);
      }
      */

      // DỮ LIỆU GIẢ LẬP ĐỂ TEST UI (Dựa theo enum trong db.sql)
      setTimeout(() => {
        setTransactions([
          { id: '1', amount: '500000.00', type: 'DEPOSIT', status: 'success', created_at: '2025-08-01T10:00:00Z' },
          { id: '2', amount: '-100000.00', type: 'BET', status: 'success', created_at: '2025-08-31T16:30:00Z' },
          { id: '3', amount: '165000.00', type: 'PAYOUT', status: 'success', created_at: '2025-08-31T20:15:00Z' },
          { id: '4', amount: '-50000.00', type: 'WITHDRAW', status: 'pending', created_at: '2026-07-07T09:00:00Z' },
        ]);
        setLoading(false);
        setRefreshing(false);
      }, 800);

    } catch (error) {
      console.error("Error loading history:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Helper format số tiền
  const formatMoney = (amount) => {
    const num = parseFloat(amount);
    const formatted = Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num > 0 ? `+${formatted}` : `-${formatted}`;
  };

  // Helper format ngày tháng (DD/MM/YYYY HH:mm)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
  };

  // Lấy Icon và Màu sắc dựa trên loại giao dịch
  const getTransactionUI = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return { icon: 'arrow-down', color: '#4cd137', label: 'Top up' }; // Xanh lá
      case 'WITHDRAW':
        return { icon: 'arrow-up', color: '#e84118', label: 'Withdraw' }; // Đỏ cam
      case 'BET':
        return { icon: 'gamepad', color: '#fbc531', label: 'Place a bet' }; // Vàng
      case 'PAYOUT':
        return { icon: 'trophy', color: '#00a8ff', label: 'Payout' }; // Xanh dương
      case 'REFUND':
        return { icon: 'rotate-left', color: '#9c88ff', label: 'Refund' }; // Tím
      default:
        return { icon: 'money-bill', color: '#fff', label: 'Transaction' };
    }
  };

  const renderTransactionItem = ({ item }) => {
    const uiData = getTransactionUI(item.type);
    const isPositive = parseFloat(item.amount) > 0;
    
    return (
      <View style={styles.transactionCard}>
        <View style={[styles.iconContainer, { backgroundColor: uiData.color + '20' }]}>
          <Icon name={uiData.icon} size={20} color={uiData.color} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionLabel}>{uiData.label}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.transactionAmount, 
            { color: isPositive ? '#4cd137' : '#e84118' } // Tiền dương màu xanh, âm màu đỏ
          ]}>
            {formatMoney(item.amount)}
          </Text>
          <Text style={[
            styles.transactionStatus, 
            item.status === 'pending' && { color: '#fbc531' }
          ]}>
            {item.status === 'pending' ? 'Pending' : 'Completed'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Danh sách */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerView}>
            <ActivityIndicator size="large" color="#00a8ff" />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.centerView}>
            <Icon name="box-open" size={50} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTransactionItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00a8ff" />
            }
          />
        )}
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ManropeBold",
  },
  backBtn: {
    padding: 5,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontFamily: "ManropeMedium",
    marginTop: 15,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "ManropeBold",
    marginBottom: 4,
  },
  transactionDate: {
    color: "#888",
    fontSize: 12,
    fontFamily: "ManropeRegular",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    marginBottom: 4,
  },
  transactionStatus: {
    color: "#aaa", // Mặc định xám cho 'Thành công' (hoặc bạn có thể cho màu xanh)
    fontSize: 12,
    fontFamily: "ManropeMedium",
  }
});

export default HistoryScreen;