import React, { useState } from "react";
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
import { makeHelpStyles } from "../../styles/help.styles";
import { createSupportTicket } from "../../services/helpService";

const CATEGORIES = ["deposit", "withdraw", "bet", "account", "other"];

const ticketSchema = Yup.object({
  category: Yup.string().oneOf(CATEGORIES).required("Please pick a category"),
  subject: Yup.string().trim().min(5, "Subject is too short").required("Subject is required"),
  message: Yup.string().trim().min(10, "Please describe the issue in more detail").required("Description is required"),
});

/**
 * Support ticket form (escalation path from the AI help chat).
 * @param {boolean} visible
 * @param {object} draft - { category, subject } suggested by the AI
 * @param {string|number} userId
 * @param {function} onClose
 */
const TicketFormModal = ({ visible, draft, userId, onClose }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeHelpStyles);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleClose = () => {
    setSubmitted(false);
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (values) => {
    setSubmitError(null);
    try {
      await createSupportTicket(userId, values);
      setSubmitted(true);
    } catch (error) {
      setSubmitError("Could not send your request. Please try again.");
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <TouchableWithoutFeedback>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.modalContent}>
              {submitted ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
                  <Text style={styles.successText}>
                    Your request has been sent.{"\n"}Our support team will get back to you soon.
                  </Text>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close ticket form"
                  >
                    <Text style={styles.submitButtonText}>DONE</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Formik
                  initialValues={{
                    category: draft?.category || "other",
                    subject: draft?.subject || "",
                    message: "",
                  }}
                  enableReinitialize
                  validationSchema={ticketSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldValue, handleSubmit: submitForm }) => (
                    <>
                      <Text style={styles.modalTitle}>SUPPORT REQUEST</Text>

                      <Text style={styles.fieldLabel}>CATEGORY</Text>
                      <View style={styles.categoryRow}>
                        {CATEGORIES.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, values.category === cat && styles.categoryChipActive]}
                            onPress={() => setFieldValue("category", cat)}
                            accessibilityRole="button"
                            accessibilityLabel={`Category ${cat}`}
                          >
                            <Text style={[styles.categoryChipText, values.category === cat && styles.categoryChipTextActive]}>
                              {cat.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={styles.fieldLabel}>SUBJECT</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Short summary of the issue"
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={values.subject}
                        onChangeText={handleChange("subject")}
                        onBlur={handleBlur("subject")}
                        accessibilityLabel="Ticket subject"
                      />
                      {touched.subject && errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}

                      <Text style={styles.fieldLabel}>DESCRIPTION</Text>
                      <TextInput
                        style={[styles.formInput, styles.formInputMultiline]}
                        placeholder="What happened? Include amounts, times, match names..."
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={values.message}
                        onChangeText={handleChange("message")}
                        onBlur={handleBlur("message")}
                        multiline
                        accessibilityLabel="Ticket description"
                      />
                      {touched.message && errors.message && <Text style={styles.errorText}>{errors.message}</Text>}

                      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

                      <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
                        onPress={submitForm}
                        disabled={isSubmitting}
                        accessibilityRole="button"
                        accessibilityLabel="Send support request"
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color={COLORS.primary} />
                        ) : (
                          <Text style={styles.submitButtonText}>SEND REQUEST</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleClose}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel ticket form"
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

export default TicketFormModal;
