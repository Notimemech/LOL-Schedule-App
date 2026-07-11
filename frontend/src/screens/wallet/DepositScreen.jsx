import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
//import api from '../../services/api'; // Axios instance đã cấu hình

const DepositScreen = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        if (!amount || isNaN(amount)) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            // Gọi API backend bạn vừa viết
            const response = await api.post('/wallet/create-payment-url', {
                amount: parseInt(amount, 10)
            });
            
            if (response.data && response.data.paymentUrl) {
                setPaymentUrl(response.data.paymentUrl);
            }
        } catch (error) {
            Alert.alert('Error', 'Cannot create VNPay order at the moment');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Theo dõi URL của WebView để biết khi nào thanh toán xong
    const handleNavigationStateChange = (navState) => {
        const { url } = navState;

        // Nếu URL trỏ về máy chủ của bạn (chứa 'vnpay-return')
        if (url.includes('vnpay-return')) {
            // Đóng WebView
            setPaymentUrl(null);
            
            // Phân tích URL để biết thành công hay thất bại
            if (url.includes('vnp_ResponseCode=00')) {
                Alert.alert('Success', 'You have successfully deposited money into your wallet!');
                // TODO: Gọi API refresh lại thông tin người dùng / số dư ví ở đây
                navigation.goBack();
            } else {
                Alert.alert('Failed', 'Transaction was cancelled or an error occurred.');
            }
        }
    };

    // Nếu đã có URL, hiển thị WebView chiếm toàn màn hình
    if (paymentUrl) {
        return (
            <WebView
                source={{ uri: paymentUrl }}
                style={{ flex: 1 }}
                onNavigationStateChange={handleNavigationStateChange}
            />
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