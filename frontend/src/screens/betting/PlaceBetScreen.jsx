import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { formatMoney, calculatePayout, parseWagerInput } from "../../utils/bettingUtils";
import { placeBet, getBetHistory, getWalletBalance, MIN_STAKE_VND, MAX_STAKE_VND, cancelBet } from "../../services/bettingService";
import { makeBettingStyles } from "../../styles/betting.styles";

import HistoryBlock from "../../components/betting/HistoryBlock";
import CustomAlert from "../../components/common/CustomAlert";

export default function PlaceBetScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeBettingStyles);
  const { match, markets, aiPrediction } = route.params || {};

  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState(null);
  const [currentOddValue, setCurrentOddValue] = useState(0);

  const [wagerInput, setWagerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);

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

  const loadData = useCallback(async () => {
    if (match?.matchId || match?.id) {
      setIsLoadingHistory(true);
      try {
        const mId = match.matchId || match.id;
        const [hist, balance] = await Promise.all([
          getBetHistory(mId),
          getWalletBalance()
        ]);
        setHistory(hist);
        setWalletBalance(balance);
      } catch (error) {
        console.log("Failed to load data", error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  }, [match]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!match || !markets) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ContentHeader title="ERROR" showBack={true} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: COLORS.text }}>No match data provided.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const wagerAmount = parseWagerInput(wagerInput);
  const potentialPayout = calculatePayout(wagerAmount, currentOddValue);

  const getErrorMessage = () => {
    if (!wagerInput) return null;
    if (wagerAmount > walletBalance) return "Insufficient balance.";
    if (wagerAmount > MAX_STAKE_VND) return `Maximum stake is ${formatMoney(MAX_STAKE_VND)} VND.`;
    if (wagerAmount > 0 && wagerAmount < MIN_STAKE_VND) return `Minimum stake is ${formatMoney(MIN_STAKE_VND)} VND.`;
    return null;
  };

  const errorMessage = getErrorMessage();

  const handlePlaceBet = async () => {
    if (!selectedOutcomeId || !selectedMarketId) {
      showAlert("Selection Required", "Please select an outcome to bet on.", true);
      return;
    }
    if (wagerAmount <= 0) {
      showAlert("Invalid Wager", "Please enter a valid wager amount.", true);
      return;
    }

    setIsSubmitting(true);
    try {
<<<<<<< Updated upstream
      const result = await placeBet(match.matchId, selectedMarketId, selectedOutcomeId, wagerAmount);
      let successMsg = result.message;
      if (result.cashback > 0) {
        successMsg += `\nVIP Bonus: You received ${formatMoney(result.cashback)} VND cashback!`;
      }
      showAlert("Success", successMsg, false, async () => {
=======
      const mId = match.matchId || match.id;
      const result = await placeBet(mId, selectedMarketId, selectedOutcomeId, wagerAmount);
      showAlert("Success", result.message, false, () => {
>>>>>>> Stashed changes
        setWagerInput("");
        setSelectedOutcomeId(null);
        setSelectedMarketId(null);
        setCurrentOddValue(0);
        setBalanceRefreshKey(prev => prev + 1);
        await loadData();
        hideAlert();
      });
    } catch (error) {
      showAlert("Bet Rejected", error.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBet = async (betId) => {
    try {
      const result = await cancelBet(betId);
      showAlert("Success", result.message, false, async () => {
        setBalanceRefreshKey(prev => prev + 1);
        await loadData();
        hideAlert();
      });
    } catch (error) {
      showAlert("Error", error.message, true);
    }
  };

  const updateWager = (amount) => {
    const newAmount = Math.max(0, wagerAmount + amount);
    setWagerInput(newAmount === 0 ? "" : newAmount.toString());
  };

  const getSuggestions = () => {
    if (!wagerInput) return [10000, 50000, 100000, 200000];
    const base = parseWagerInput(wagerInput);
    if (base === 0) return [10000, 50000, 100000, 200000];

    const suggestions = [];

    [10, 100, 1000, 10000, 100000, 1000000].forEach(mult => {
      const val = base * mult;
      if (val >= 10000 && val <= MAX_STAKE_VND) {
        suggestions.push(val);
      }
    });

    if (suggestions.length < 4) {
      const increments = [10000, 50000, 100000, 500000, 1000000];
      for (const inc of increments) {
        const val = base + inc;
        if (val <= MAX_STAKE_VND && !suggestions.includes(val)) {
          suggestions.push(val);
        }
        if (suggestions.length >= 4) break;
      }
    }

    return suggestions.sort((a, b) => a - b).slice(0, 4);
  };

  const renderBetHistory = () => {
    if (isLoadingHistory) {
      return <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />;
    }
    if (history.length === 0) {
      return <Text style={styles.emptyHistoryText}>No bets placed for this match yet.</Text>;
    }
    return history.map(bet => (
      <HistoryBlock key={bet.id} bet={bet} onCancel={handleCancelBet} />
    ));
  };

  const formatMarketName = (marketType) => marketType.replace(/_/g, " ").toUpperCase();

  const getOutcomeLabel = (odd, market) => {
    const team1Slug = match?.team1?.slug;
    const team2Slug = match?.team2?.slug;

    if (odd.option_key === team1Slug) {
      return match?.team1?.code || match?.team1?.name || "Team 1";
    }

    if (odd.option_key === team2Slug) {
      return match?.team2?.code || match?.team2?.name || "Team 2";
    }

    if (odd.option_key) {
      return odd.option_key.replace(/_/g, ' ').toUpperCase();
    }

    return "Outcome";
  };

  const userBetOptions = history.reduce((acc, bet) => {
    if (bet.status !== 'Cancelled') {
      acc[bet.marketId] = bet.outcomeId;
    }
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="PLACE BET" showBack={true} refreshTrigger={balanceRefreshKey} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

          {/* AI INSIGHT BANNER IF AVAILABLE */}
          {aiPrediction && (
            <View style={{
              backgroundColor: COLORS.cardElevated,
              borderColor: COLORS.borderActive,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginBottom: 16
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontFamily: 'SpaceGroteskBold', fontSize: 12, marginLeft: 6 }}>
                  AI ANALYST SUGGESTION
                </Text>
              </View>
              <Text style={{ color: COLORS.textSecondary, fontFamily: 'Manrope', fontSize: 12 }}>
                Dự đoán: Tỷ lệ thắng {match.team1?.code || 'Team 1'} {aiPrediction.team1_win_rate}% - {aiPrediction.team2_win_rate}% {match.team2?.code || 'Team 2'}.
              </Text>
              {aiPrediction.betting_tip && (
                <Text style={{ color: COLORS.warning, fontFamily: 'ManropeBold', fontSize: 12, marginTop: 4 }}>
                  💡 {aiPrediction.betting_tip}
                </Text>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>SELECT MARKET</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {markets.map((market) => {
              const betOptionForMarket = userBetOptions[market.id];
              return (
                <View key={market.id} style={{ width: '48%', backgroundColor: COLORS.card, borderRadius: 8, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border }}>
                  <Text style={{ fontFamily: "SpaceGroteskBold", fontSize: 11, color: COLORS.textMuted, marginBottom: 8, textAlign: 'center' }}>
                    {formatMarketName(market.market_type)}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {market.odds.map(odd => {
                      const outcomeLabel = getOutcomeLabel(odd, market);
                      const isSelected = selectedMarketId === market.id && selectedOutcomeId === odd.option_key;
                      const parsedOdd = parseFloat(odd.odd_value);
                      const isOppositeOption = betOptionForMarket && betOptionForMarket !== odd.option_key;

                      return (
                        <TouchableOpacity
                          key={odd.id}
                          style={[
                            styles.oddBox, 
                            { padding: 6, marginHorizontal: 2 }, 
                            isSelected && styles.oddBoxSelected,
                            isOppositeOption && { opacity: 0.3 }
                          ]}
                          disabled={isOppositeOption}
                          onPress={() => {
                            setSelectedMarketId(market.id);
                            setSelectedOutcomeId(odd.option_key);
                            setCurrentOddValue(parsedOdd);
                          }}
                        >
                          <Text style={[styles.oddLabel, { fontSize: 10, marginBottom: 2 }]}>{outcomeLabel}</Text>
                          <Text style={[styles.oddValue, { fontSize: 13 }, isSelected && styles.oddValueSelected]}>{parsedOdd.toFixed(2)}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.circleButton} onPress={() => updateWager(-10000)}>
                <Ionicons name="remove" size={24} color={COLORS.text} />
              </TouchableOpacity>

              <View style={styles.wagerInputWrapper}>
                <TextInput
                  style={styles.wagerInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={wagerInput ? formatMoney(wagerInput) : ""}
                  onChangeText={(text) => {
                    if (!text) {
                      setWagerInput("");
                    } else {
                      const parsed = parseWagerInput(text);
                      setWagerInput(parsed > 0 ? parsed.toString() : "");
                    }
                  }}
                  editable={!isSubmitting}
                />
                <Text style={styles.currencySuffix}>VND</Text>
              </View>

              <TouchableOpacity style={styles.circleButton} onPress={() => updateWager(10000)}>
                <Ionicons name="add" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.suggestionsRow}>
              {getSuggestions().map(val => (
                <TouchableOpacity
                  key={val}
                  style={styles.suggestionChip}
                  onPress={() => setWagerInput(val.toString())}
                >
                  <Text style={styles.suggestionText}>{formatMoney(val)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {!!errorMessage && (
              <Text style={{ color: COLORS.danger, fontFamily: "ManropeBold", fontSize: 14, marginBottom: 12, textAlign: "center" }}>
                {errorMessage}
              </Text>
            )}

            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>POTENTIAL PAYOUT:</Text>
              <Text style={styles.payoutValue}>{formatMoney(potentialPayout)} VND</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedOutcomeId || isSubmitting || !!errorMessage || wagerAmount <= 0 || match.state === "finished") && styles.submitButtonDisabled
              ]}
              onPress={handlePlaceBet}
              disabled={isSubmitting || !selectedOutcomeId || !!errorMessage || wagerAmount <= 0 || match.state === "finished"}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={[styles.submitButtonText, !selectedOutcomeId && styles.submitButtonTextDisabled]}>
                  {match.state === "finished" ? "BETTING CLOSED" : "CONFIRM BET"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>MY BETS FOR THIS MATCH</Text>
          {renderBetHistory()}

        </ScrollView>
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
}
