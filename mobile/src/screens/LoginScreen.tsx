import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { api } from '../services/api';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!phone || phone.length !== 10) {
            setError('Số điện thoại phải có 10 số');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.login(phone, name || undefined);
            onLoginSuccess();
        } catch (err: unknown) {
            setError((err as Error).message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Title style={styles.title}>🌱 Agri-Loop</Title>
                <Text style={styles.subtitle}>Trợ lý AI ủ phân hữu cơ</Text>

                <TextInput
                    label="Số điện thoại"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="phone" />}
                />

                <TextInput
                    label="Tên của bác (tuỳ chọn)"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="account" />}
                />

                {error ? <HelperText type="error">{error}</HelperText> : null}

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Bắt đầu
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 8,
        color: '#2e7d32',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: '#666',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        backgroundColor: '#2e7d32',
    },
    buttonContent: {
        paddingVertical: 8,
    },
});
