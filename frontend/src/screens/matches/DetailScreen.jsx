import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ContentHeader from "../../components/common/ContentHeader";
import COLORS from "../../styles/colors";
import { formatMoney, calculatePayout, parseWagerInput } from "../../utils/bettingUtils";
import { placeBet } from "../../services/bettingService";
import { detailStyles as styles } from "../../styles/matches.styles";

export default function DetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const match = route.params?.match;

  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [wagerInput, setWagerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock odds for demonstration
  const ODDS = {
    team1: 1.85,
    team2: 2.10
  };

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ContentHeader title="ERROR" />
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>No match data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const wagerCents = parseWagerInput(wagerInput);
  const potentialPayoutCents = selectedOutcome ? calculatePayout(wagerCents, ODDS[selectedOutcome]) : 0;

  const handlePlaceBet = async () => {
    if (!selectedOutcome) {
      Alert.alert("Selection Required", "Please select an outcome to bet on.");
      return;
    }
    if (wagerCents <= 0) {
      Alert.alert("Invalid Wager", "Please enter a valid wager amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await placeBet(match.matchId, selectedOutcome, wagerCents);
      Alert.alert("Success", result.message, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Bet Rejected", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="MATCH TERMINAL" showBack={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* MATCH HEADER */}
          <View style={styles.matchHeaderBox}>
            <Text style={styles.leagueText}>{match.leagueName?.toUpperCase()}</Text>
            <View style={styles.teamsRow}>
              <View style={styles.teamCol}>
                <Image source={{ uri: match.team1.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{match.team1.code}</Text>
              </View>
              <View style={styles.vsBox}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.teamCol}>
                <Image source={{ uri: match.team2.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                <Text style={styles.teamCode}>{match.team2.code}</Text>
              </View>
            </View>
          </View>

          {/* MARKET SECTION */}
          <Text style={styles.sectionTitle}>MATCH WINNER</Text>
          <View style={styles.marketRow}>
            <TouchableOpacity
              style={[styles.oddBox, selectedOutcome === 'team1' && styles.oddBoxSelected]}
              onPress={() => setSelectedOutcome('team1')}
            >
              <Text style={styles.oddTeamCode}>{match.team1.code}</Text>
              <Text style={styles.oddValue}>{ODDS.team1.toFixed(2)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.oddBox, selectedOutcome === 'team2' && styles.oddBoxSelected]}
              onPress={() => setSelectedOutcome('team2')}
            >
              <Text style={styles.oddTeamCode}>{match.team2.code}</Text>
              <Text style={styles.oddValue}>{ODDS.team2.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>

          {/* BET SLIP */}
          {selectedOutcome && (
            <View style={styles.betSlipBox}>
              <Text style={styles.betSlipTitle}>BET SLIP</Text>

              <View style={styles.inputRow}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.wagerInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  value={wagerInput}
                  onChangeText={setWagerInput}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>POTENTIAL PAYOUT:</Text>
                <Text style={styles.payoutValue}>${formatMoney(potentialPayoutCents)}</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handlePlaceBet}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.submitButtonText}>CONFIRM BET</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
