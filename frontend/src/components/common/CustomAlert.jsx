import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../styles/colors';

const CustomAlert = ({ visible, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'CANCEL', isError = false }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={[styles.title, isError && styles.errorTitle]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertBox: {
    width: '80%',
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center'
  },
  errorTitle: {
    color: COLORS.danger,
  },
  message: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 14,
    color: COLORS.textMuted,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center'
  },
  confirmButtonText: {
    fontFamily: 'SpaceGroteskBold',
    fontSize: 14,
    color: COLORS.buttonPrimaryText,
  }
});

export default CustomAlert;
