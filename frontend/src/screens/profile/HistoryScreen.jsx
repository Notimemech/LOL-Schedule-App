import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/FontAwesome6";
import COLORS from "../../styles/colors";
import api from "../../services/api";

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [userId, setUserId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) {
        setTransactions([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const user = JSON.parse(rawUser);
      setUserId(user.id);

      const response = await api.get(`/wallet/transactions/${user.id}`);
      const list = response?.data ?? response ?? [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error loading history:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const subscription = DeviceEventEmitter.addListener('wallet:transactions-updated', () => {
      fetchTransactions();
    });

    return () => subscription.remove();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

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

  const filteredTransactions = transactions.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'DEPOSIT') return item.type === 'DEPOSIT';
    if (filter === 'WITHDRAW') return item.type === 'WITHDRAW';
    if (filter === 'BET') return item.type === 'BET' || item.type === 'PAYOUT' || item.type === 'REFUND';
    return true;
  });

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
        return { icon: 'wallet', color: '#4cd137', label: 'Top up', bg: '#1d4d2f' };
      case 'WITHDRAW':
        return { icon: 'cash', color: '#ff6b6b', label: 'Withdraw', bg: '#4a1f2a' };
      case 'BET':
        return { icon: 'gamepad', color: '#f4b942', label: 'Place a bet', bg: '#433117' };
      case 'PAYOUT':
        return { icon: 'trophy', color: '#38bdf8', label: 'Payout', bg: '#153a4f' };
      case 'REFUND':
        return { icon: 'rotate-left', color: '#a78bfa', label: 'Refund', bg: '#2f2359' };
      default:
        return { icon: 'money-bill', color: '#ffffff', label: 'Transaction', bg: '#2b2f3a' };
    }
  };

  const renderTransactionItem = ({ item }) => {
    const uiData = getTransactionUI(item.type);
    const isPositive = parseFloat(item.amount) > 0;
    
    return (
      <View style={styles.transactionCard}>
        <View style={[styles.iconContainer, { backgroundColor: uiData.bg }]}>
          <Icon name={uiData.icon} size={18} color={uiData.color} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionLabel}>{uiData.label}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.transactionAmount,
            { color: isPositive ? '#4cd137' : '#ff6b6b' }
          ]}>
            {formatMoney(item.amount)}
          </Text>
          <Text style={[
            styles.transactionStatus,
            item.status === 'pending' && { color: '#f4b942' },
            item.status === 'success' && { color: '#4cd137' }
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

      <View style={styles.tabsRow}>
        {['ALL', 'DEPOSIT', 'WITHDRAW', 'BET'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
              {tab === 'ALL' ? 'All' : tab === 'DEPOSIT' ? 'Deposit' : tab === 'WITHDRAW' ? 'Withdraw' : 'Bet'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerView}>
            <ActivityIndicator size="large" color="#00a8ff" />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.centerView}>
            <Icon name="box-open" size={50} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
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
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "ManropeBold",
  },
  activeTabText: {
    color: "#051018",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 4,
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
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLabel: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "ManropeBold",
    marginBottom: 4,
  },
  transactionDate: {
    color: "#95a5b4",
    fontSize: 12,
    fontFamily: "ManropeRegular",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    marginBottom: 4,
  },
  transactionStatus: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "ManropeMedium",
  }
});

export default HistoryScreen;