import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Dimensions, ImageBackground } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { api } from '../services/api';
import { FarmerTheme } from '../theme';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!phone || phone.length !== 10 || !phone.startsWith('0')) {
            setError('Số điện thoại không hợp lệ');
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
            {/* Background Decoration */}
            <View style={styles.topCircle} />

            <View style={styles.contentContainer}>
                {/* Brand Section */}
                <View style={styles.brandWrapper}>
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="sprout" size={64} color={FarmerTheme.colors.accent} />
                    </View>
                    <Text style={styles.brandTitle}>Agri-Loop</Text>
                    <Text style={styles.brandSubtitle}>Trợ lý ủ phân hữu cơ</Text>
                    <View style={styles.taglineBox}>
                        <Text style={styles.tagline}>BIẾN PHỤ PHẨM THÀNH TÀI NGUYÊN</Text>
                    </View>
                </View>

                {/* Login Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>XIN CHÀO BÁC NÔNG DÂN</Text>

                    <TextInput
                        label="Số điện thoại của bác"
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text.replace(/[^0-9]/g, ''));
                            setError('');
                        }}
                        keyboardType="phone-pad"
                        maxLength={10}
                        style={styles.input}
                        mode="outlined"
                        outlineColor={FarmerTheme.colors.border}
                        activeOutlineColor={FarmerTheme.colors.primary}
                        left={<TextInput.Icon icon={() => <AntDesign name="phone" size={24} color={FarmerTheme.colors.primary} />} />}
                        theme={{ colors: { background: '#fff' } }}
                    />

                    <TextInput
                        label="Tên (Để gọi cho thân mật)"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        mode="outlined"
                        outlineColor={FarmerTheme.colors.border}
                        activeOutlineColor={FarmerTheme.colors.primary}
                        left={<TextInput.Icon icon={() => <AntDesign name="user" size={24} color={FarmerTheme.colors.primary} />} />}
                        theme={{ colors: { background: '#fff' } }}
                    />

                    {error ? (
                        <View style={styles.errorBox}>
                            <AntDesign name="warning" size={18} color={FarmerTheme.colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading || phone.length < 10}
                        style={styles.button}
                        contentStyle={{ height: 56 }}
                        labelStyle={styles.buttonLabel}
                    >
                        {loading ? 'ĐANG KẾT NỐI...' : 'BẮT ĐẦU NGAY'}
                    </Button>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>YDCC 2025 - Youth Digital Citizen Challenge</Text>
                    <Text style={styles.footerSub}>Phiên bản Pro Max - Golden Harvest</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    topCircle: {
        position: 'absolute', top: -height * 0.2, left: -width * 0.2,
        width: width * 1.4, height: width * 1.4, borderRadius: width * 0.7,
        backgroundColor: FarmerTheme.colors.primary,
        opacity: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },

    // Brand
    brandWrapper: { alignItems: 'center', marginBottom: 40 },
    logoCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
        elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8
    },
    brandTitle: {
        fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4
    },
    brandSubtitle: {
        fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4, letterSpacing: 0.5
    },
    taglineBox: {
        marginTop: 16, paddingHorizontal: 12, paddingVertical: 4,
        backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12
    },
    tagline: { color: FarmerTheme.colors.accent, fontWeight: '800', fontSize: 12, letterSpacing: 1 },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
    },
    cardTitle: {
        fontSize: 20, fontWeight: '800', color: FarmerTheme.colors.primary, marginBottom: 24, textAlign: 'center', letterSpacing: 0.5
    },
    input: {
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#fff1f0', padding: 12, borderRadius: 8,
        marginBottom: 20, borderWidth: 1, borderColor: '#ffccc7',
    },
    errorText: { color: FarmerTheme.colors.error, fontSize: 14, fontWeight: '600' },

    button: {
        borderRadius: 28,
        backgroundColor: FarmerTheme.colors.accent, // Gold CTA
        elevation: 4, shadowColor: FarmerTheme.colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8
    },
    buttonLabel: {
        fontSize: 18, fontWeight: '800', letterSpacing: 1, color: '#fff',
    },

    // Footer
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { fontSize: 12, color: FarmerTheme.colors.textSecondary, fontWeight: '600' },
    footerSub: { fontSize: 10, color: FarmerTheme.colors.placeholder, marginTop: 4 },
});
