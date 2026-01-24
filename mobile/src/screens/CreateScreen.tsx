import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title, RadioButton, HelperText } from 'react-native-paper';
import { api } from '../services/api';
import { CreateScreenProps } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

export default function CreateScreen({ navigation }: CreateScreenProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState('straw');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [error, setError] = useState('');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
        }
    };


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
                imageBase64: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
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

                <Button mode="outlined" onPress={pickImage} style={styles.input}>
                    {image ? 'Chọn ảnh khác' : 'Chụp ảnh / Chọn ảnh'}
                </Button>

                {image && (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                )}


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
    previewImage: { width: '100%', height: 200, marginBottom: 16, borderRadius: 8 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
    button: { marginTop: 24, backgroundColor: '#2e7d32' },
    buttonContent: { paddingVertical: 8 },
});
