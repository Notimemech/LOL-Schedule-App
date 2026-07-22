import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import api from '../../services/api';
import { useTheme, useThemedStyles } from '../../hooks/useTheme';
import CustomAlert from '../../components/common/CustomAlert';

const DepositScreen = ({ navigation }) => {
    const { colors: COLORS } = useTheme();
    const styles = useThemedStyles(makeStyles);
    const [amount, setAmount] = useState('');
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const handleDeposit = async () => {
        if (!amount || isNaN(amount)) {
            showAlert('Error', 'Please enter a valid amount', true);
            return;
        }

        setLoading(true);
        try {
            // Gọi API backend bạn vừa viết
            const response = await api.post('/wallet/create-payment-url', {
                amount: parseInt(amount, 10)
            });
            
            const paymentUrl = response?.paymentUrl || response?.data?.paymentUrl;
            if (paymentUrl) {
                setPaymentUrl(paymentUrl);
            }
        } catch (error) {
            showAlert('Error', 'Cannot create VNPay order at the moment', true);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigationStateChange = (navState) => {
        // Intercept logic removed. Handled by onMessage.
    };

    const handleWebViewMessage = async (event) => {
        try {
            const payload = JSON.parse(event.nativeEvent.data);
            setPaymentUrl(null);
            if (payload?.status === 'success') {
                showAlert('Success', 'You have successfully deposited money into your wallet!', false, () => {
                    hideAlert();
                    navigation.goBack();
                });
            } else {
                showAlert('Failed', 'Transaction was cancelled or an error occurred.', true);
            }
        } catch (error) {
            console.warn('Unable to parse WebView message:', error);
        }
    };

    // Nếu đã có URL, hiển thị WebView chiếm toàn màn hình
    if (paymentUrl) {
        return (
            <>
                <WebView
                    source={{ uri: paymentUrl }}
                    style={{ flex: 1 }}
                    onNavigationStateChange={handleNavigationStateChange}
                    onMessage={handleWebViewMessage}
                />
                <CustomAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    isError={alertConfig.isError}
                    onConfirm={alertConfig.onConfirm}
                />
            </>
        );
    }

    // Giao diện nhập số tiền
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Deposit Money into Wallet</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter amount (VND)"
                placeholderTextColor={COLORS.inputPlaceholder}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                accessibilityLabel="Deposit amount"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleDeposit}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Pay with VNPay"
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.buttonPrimaryText} />
                ) : (
                    <Text style={styles.buttonText}>Pay with VNPay</Text>
                )}
            </TouchableOpacity>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                isError={alertConfig.isError}
                onConfirm={alertConfig.onConfirm}
            />
        </View>
    );
};

const makeStyles = (COLORS) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 24,
        color: COLORS.text,
        fontFamily: 'SpaceGroteskBold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLORS.buttonPrimary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.buttonPrimaryText,
        fontSize: 16,
        fontFamily: 'ManropeBold',
    }
});

export default DepositScreen;