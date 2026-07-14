import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
  ScrollView
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/FontAwesome6";
import COLORS from "../../styles/colors";
import api from "../../services/api";
import ContentHeader from "../../components/common/ContentHeader";
import TransactionItem from "../../components/wallet/TransactionItem";
import { historyStyles as styles } from "../../styles/history.styles";
import { formatMoney } from "../../utils/format";

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'DEPOSIT', label: 'Deposit' },
  { key: 'WITHDRAW', label: 'Withdraw' },
  { key: 'BET', label: 'Bets' },
];

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [balance, setBalance] = useState(0);

  const fetchTransactions = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('userInfo');
      if (!rawUser) { setTransactions([]); setLoading(false); setRefreshing(false); return; }
      const user = JSON.parse(rawUser);

      // Load balance
      const walletRes = await api.get(`/wallet/${user.id}`);
      const walletData = walletRes?.data ?? walletRes;
      if (walletData) setBalance(Number(walletData.balance || 0));

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
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };


  const filteredTransactions = transactions.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'DEPOSIT') return item.type === 'DEPOSIT';
    if (filter === 'WITHDRAW') return item.type === 'WITHDRAW';
    if (filter === 'BET') return item.type === 'BET' || item.type === 'PAYOUT' || item.type === 'REFUND';
    return true;
  });

  const renderTransactionItem = ({ item }) => {
    return <TransactionItem tx={item} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ContentHeader title="TRANSACTION HISTORY" showBack={true} />

      {/* Balance Summary */}
      <View style={styles.headerContent}>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
          <Text style={styles.balanceAmount}>{formatMoney(balance)} VNĐ</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {TABS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tabBtn, filter === key && styles.tabBtnActive]}
              onPress={() => setFilter(key)}
            >
              <Text style={[styles.tabText, filter === key && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listContent}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySub}>Your transaction history will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTransactionItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;