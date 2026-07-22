import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeScheduleStyles } from "../../styles/matches.styles";

/**
 * Filter Modal used in ScheduleScreen.
 */
const FilterModal = ({ 
  visible, 
  onClose, 
  onApply, 
  onReset,
  tempFilters,
  setTempFilters,
  availableLeagues,
  availableTournaments,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeScheduleStyles);
  const toggleFilter = (type, value) => {
    setTempFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>FILTER MATCHES</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* MATCH STATE */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>MATCH STATE</Text>
              <View style={styles.filterChipsRow}>
                {["UPCOMING", "LIVE", "FINISHED"].map(state => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.filterChip,
                      tempFilters.state === state && styles.filterChipActive
                    ]}
                    onPress={() => toggleFilter('state', state)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      tempFilters.state === state && styles.filterChipTextActive
                    ]}>{state}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* LEAGUES */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>LEAGUE</Text>
              <View style={styles.filterChipsRow}>
                {availableLeagues.map(league => (
                  <TouchableOpacity
                    key={league}
                    style={[
                      styles.filterChip,
                      tempFilters.league === league && styles.filterChipActive
                    ]}
                    onPress={() => toggleFilter('league', league)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      tempFilters.league === league && styles.filterChipTextActive
                    ]}>{league}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TOURNAMENTS */}
            {availableTournaments.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>TOURNAMENT</Text>
                <View style={styles.filterChipsRow}>
                  {availableTournaments.map(tour => (
                    <TouchableOpacity
                      key={tour}
                      style={[
                        styles.filterChip,
                        tempFilters.tournament === tour && styles.filterChipActive
                      ]}
                      onPress={() => toggleFilter('tournament', tour)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        tempFilters.tournament === tour && styles.filterChipTextActive
                      ]}>{tour}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.resetButtonText}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
