import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import api from '../../services/api';
import CustomAlert from '../../components/common/CustomAlert';

const DepositScreen = ({ navigation }) => {
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
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            
            <TouchableOpacity 
                style={styles.button} 
                onPress={handleDeposit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#1a1a2e', // Màu tối hợp với LOL App
    },
    title: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#00a8ff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default DepositScreen;