import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, RadioButton, HelperText } from 'react-native-paper';
import { api } from '../services/api';
import { CreateScreenProps } from '../types/navigation';

export default function CreateScreen({ navigation }: CreateScreenProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState('straw');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Vui lòng nhập tên cho đống ủ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.createByProduct({
                name: name.trim(),
                type,
                location: '0,0',
            });
            navigation.goBack();
        } catch (err: unknown) {
            setError((err as Error).message || 'Tạo thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <Title style={styles.title}>Tạo đống ủ mới</Title>

                <TextInput
                    label="Tên đống ủ"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    placeholder="VD: Đống rơm ruộng trên"
                />

                <Text style={styles.label}>Loại phụ phẩm:</Text>
                <RadioButton.Group onValueChange={setType} value={type}>
                    <RadioButton.Item label="🌾 Rơm rạ" value="straw" />
                    <RadioButton.Item label="🦐 Vỏ tôm" value="shrimp_shell" />
                    <RadioButton.Item label="🌿 Bèo tây" value="hyacinth" />
                    <RadioButton.Item label="❓ Khác" value="unknown" />
                </RadioButton.Group>

                {error ? <HelperText type="error">{error}</HelperText> : null}

                <Button
                    mode="contained"
                    onPress={handleCreate}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Tạo đống ủ
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 24 },
    title: { fontSize: 24, marginBottom: 24, color: '#2e7d32' },
    input: { marginBottom: 16 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
    button: { marginTop: 24, backgroundColor: '#2e7d32' },
    buttonContent: { paddingVertical: 8 },
});
