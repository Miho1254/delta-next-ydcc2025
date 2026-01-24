import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, Surface } from 'react-native-paper';
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
        if (!phone || phone.length !== 10 || !phone.startsWith('0')) {
            setError('Số điện thoại phải bắt đầu bằng 0 và có 10 số');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.login(phone, name || undefined);
            onLoginSuccess();
        } catch (err: unknown) {
            setError((err as Error).message || 'Đăng nhập thất bại, vui lòng thử lại');
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
                {/* Logo Area */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoEmoji}>🌱</Text>
                    <Title style={styles.title}>Agri-Loop</Title>
                    <Text style={styles.subtitle}>Trợ lý AI ủ phân hữu cơ</Text>
                    <Text style={styles.tagline}>Chuyển đổi phụ phẩm thành tài nguyên</Text>
                </View>

                {/* Form */}
                <Surface style={styles.formContainer} elevation={2}>
                    <TextInput
                        label="Số điện thoại"
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text.replace(/[^0-9]/g, ''));
                            setError('');
                        }}
                        keyboardType="phone-pad"
                        maxLength={10}
                        style={styles.input}
                        mode="outlined"
                        left={<TextInput.Icon icon="phone" />}
                        outlineColor="#2e7d32"
                        activeOutlineColor="#2e7d32"
                    />

                    <TextInput
                        label="Tên của bác (tuỳ chọn)"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        mode="outlined"
                        left={<TextInput.Icon icon="account" />}
                        outlineColor="#2e7d32"
                        activeOutlineColor="#2e7d32"
                    />

                    {error ? <HelperText type="error" style={styles.error}>{error}</HelperText> : null}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading || phone.length < 10}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        {loading ? 'Đang xử lý...' : 'Bắt đầu ngay'}
                    </Button>
                </Surface>

                {/* Footer */}
                <Text style={styles.footer}>
                    YDCC 2025 - Youth Digital Citizen Challenge
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoEmoji: {
        fontSize: 64,
        marginBottom: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#388e3c',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    formContainer: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    error: {
        marginBottom: 8,
    },
    button: {
        marginTop: 8,
        backgroundColor: '#2e7d32',
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        marginTop: 32,
        color: '#666',
        fontSize: 12,
    },
});
