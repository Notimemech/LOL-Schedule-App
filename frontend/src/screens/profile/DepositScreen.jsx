import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ContentHeader from "../../components/common/ContentHeader";
import COLORS from "../../styles/colors";
import Icon from "react-native-vector-icons/FontAwesome6";

export default function DepositScreen() {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [amount, setAmount] = useState("");

  const methods = [
    { id: "momo", title: "MoMo E-Wallet", icon: "wallet" },
    { id: "bank", title: "Bank Transfer", icon: "building-columns" },
    { id: "card", title: "Scratch Card", icon: "money-check" },
  ];

  const presetAmounts = ["50000", "100000", "200000", "500000"];

  const handleDeposit = () => {
    if (!amount) {
      Alert.alert("Error", "Please select or enter an amount");
      return;
    }
    Alert.alert(
      "Success",
      `Deposit request for ${parseInt(amount).toLocaleString()} VNĐ via ${selectedMethod} has been submitted!`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="DEPOSIT" showBack={true} />
      <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
        <View style={styles.methodsContainer}>
          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.7}
            >
              <Icon 
                name={method.icon} 
                style={[
                  styles.methodIcon, 
                  selectedMethod === method.id && styles.methodIconActive
                ]} 
              />
              <Text 
                style={[
                  styles.methodTitle,
                  selectedMethod === method.id && styles.methodTitleActive
                ]}
              >
                {method.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>SELECT AMOUNT (VNĐ)</Text>
        <View style={styles.amountGrid}>
          {presetAmounts.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.amountCard,
                amount === preset && styles.amountCardActive
              ]}
              onPress={() => setAmount(preset)}
            >
              <Text style={[
                styles.amountText,
                amount === preset && styles.amountTextActive
              ]}>
                {parseInt(preset).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.depositButton}
          onPress={handleDeposit}
          activeOpacity={0.8}
        >
          <Text style={styles.depositButtonText}>CONFIRM DEPOSIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontFamily: "SpaceGroteskBold",
    fontSize: 16,
    letterSpacing: 1.5,
    marginBottom: 15,
    marginTop: 20,
  },
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    gap: 15,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glowSoft,
  },
  methodIcon: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  methodIconActive: {
    color: COLORS.primary,
  },
  methodTitle: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGrotesk",
    fontSize: 16,
  },
  methodTitleActive: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  amountCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  amountCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glowSoft,
  },
  amountText: {
    color: COLORS.textSecondary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 18,
  },
  amountTextActive: {
    color: COLORS.primary,
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  depositButtonText: {
    color: COLORS.background,
    fontFamily: "SpaceGroteskBold",
    fontSize: 18,
    letterSpacing: 2,
  },
});
