import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeFriendBetModalStyles } from "../../styles/friends.styles";
import { createFriendBet, getFriendsOverview } from "../../services/friendService";

const betSchema = Yup.object({
  opponentId: Yup.string().required("Pick a friend to challenge"),
  creatorTeamId: Yup.string().required("Pick your team"),
  name: Yup.string().trim().min(3, "Name is too short").required("Give the wager a name"),
  stakeLabel: Yup.string().trim().required("What are you playing for?"),
});

/**
 * Create a friendly honor wager on this match against a friend.
 * The opponent automatically backs the other team.
 */
const CreateFriendBetModal = ({ visible, match, userId, onClose }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeFriendBetModalStyles);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (visible && userId) {
      setSubmitted(false);
      setSubmitError(null);
      setLoadingFriends(true);
      getFriendsOverview(userId)
        .then((data) => setFriends(data.friends))
        .catch(() => setFriends([]))
        .finally(() => setLoadingFriends(false));
    }
  }, [visible, userId]);

  const handleSubmit = async (values) => {
    setSubmitError(null);
    try {
      await createFriendBet({
        creatorId: userId,
        opponentId: values.opponentId,
        matchId: match.matchId,
        name: values.name,
        stakeLabel: values.stakeLabel,
        creatorTeamId: values.creatorTeamId,
      });
      setSubmitted(true);
    } catch (error) {
      const message = error?.response?.data?.message || "Could not create the wager.";
      setSubmitError(message);
    }
  };

  const teams = [match?.team1, match?.team2].filter(Boolean);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.content}>
              {submitted ? (
                <View style={styles.successBox}>
                  <Ionicons name="trophy-outline" size={48} color={COLORS.success} />
                  <Text style={styles.successText}>
                    Wager is ON!{"\n"}It settles automatically when the match ends.
                  </Text>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close wager form"
                  >
                    <Text style={styles.submitButtonText}>DONE</Text>
                  </TouchableOpacity>
                </View>
              ) : loadingFriends ? (
                <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 30 }} />
              ) : friends.length === 0 ? (
                <View style={styles.successBox}>
                  <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyFriendsText}>
                    You need a friend first — add one in Profile → Friends.
                  </Text>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Text style={styles.cancelButtonText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Formik
                  initialValues={{ opponentId: "", creatorTeamId: "", name: "", stakeLabel: "" }}
                  validationSchema={betSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldValue, handleSubmit: submitForm }) => (
                    <>
                      <Text style={styles.title}>CHALLENGE A FRIEND</Text>

                      <Text style={styles.fieldLabel}>OPPONENT</Text>
                      <View style={styles.chipsRow}>
                        {friends.map((friend) => (
                          <TouchableOpacity
                            key={friend.id}
                            style={[styles.chip, values.opponentId === String(friend.id) && styles.chipActive]}
                            onPress={() => setFieldValue("opponentId", String(friend.id))}
                            accessibilityRole="button"
                            accessibilityLabel={`Challenge ${friend.username}`}
                          >
                            <Text style={[styles.chipText, values.opponentId === String(friend.id) && styles.chipTextActive]}>
                              {friend.username}#{friend.tag}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {touched.opponentId && errors.opponentId && (
                        <Text style={styles.errorText}>{errors.opponentId}</Text>
                      )}

                      <Text style={styles.fieldLabel}>YOUR TEAM (they get the other)</Text>
                      <View style={styles.chipsRow}>
                        {teams.map((team) => (
                          <TouchableOpacity
                            key={team.id}
                            style={[styles.chip, values.creatorTeamId === String(team.id) && styles.chipActive]}
                            onPress={() => setFieldValue("creatorTeamId", String(team.id))}
                            accessibilityRole="button"
                            accessibilityLabel={`Pick ${team.code}`}
                          >
                            <Text style={[styles.chipText, values.creatorTeamId === String(team.id) && styles.chipTextActive]}>
                              {team.code}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {touched.creatorTeamId && errors.creatorTeamId && (
                        <Text style={styles.errorText}>{errors.creatorTeamId}</Text>
                      )}

                      <Text style={styles.fieldLabel}>WAGER NAME</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='e.g. "Kèo trà sữa chung kết"'
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={values.name}
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                        accessibilityLabel="Wager name"
                      />
                      {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                      <Text style={styles.fieldLabel}>STAKE (anything you like)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='e.g. "1 ly trà sữa" / "50k"'
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={values.stakeLabel}
                        onChangeText={handleChange("stakeLabel")}
                        onBlur={handleBlur("stakeLabel")}
                        accessibilityLabel="Wager stake"
                      />
                      {touched.stakeLabel && errors.stakeLabel && (
                        <Text style={styles.errorText}>{errors.stakeLabel}</Text>
                      )}

                      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

                      <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
                        onPress={submitForm}
                        disabled={isSubmitting}
                        accessibilityRole="button"
                        accessibilityLabel="Create wager"
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color={COLORS.primary} />
                        ) : (
                          <Text style={styles.submitButtonText}>LOCK IT IN</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel wager"
                      >
                        <Text style={styles.cancelButtonText}>CANCEL</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default CreateFriendBetModal;
