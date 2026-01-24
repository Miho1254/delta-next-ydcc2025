import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { api } from '../services/api';
import { CreateScreenProps } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { FarmerTheme } from '../theme';

// Pre-defined categories for fallback or correction
const FALLBACK_CATEGORIES = [
    { label: 'Rơm rạ', value: 'Rơm rạ', icon: 'grass' },
    { label: 'Vỏ tôm', value: 'Vỏ tôm', icon: 'fish' },
    { label: 'Lục bình', value: 'Lục bình', icon: 'flower-tulip' }, // material-community icons
    { label: 'Phân chuồng', value: 'Phân chuồng', icon: 'barn' },
];

export default function CreateScreen({ navigation }: CreateScreenProps) {
    const [step, setStep] = useState<'camera' | 'predicting' | 'confirm'>('camera');
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [predictedName, setPredictedName] = useState('');
    const [finalName, setFinalName] = useState('');
    const [locationCoords, setLocationCoords] = useState('0,0');
    const [loading, setLoading] = useState(false);

    // Auto open camera on mount (mocked by picker for simulator)
    useEffect(() => {
        pickImage();
        getLocation();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocationCoords(`${loc.coords.latitude},${loc.coords.longitude}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setImageBase64(result.assets[0].base64 || null);
                if (result.assets[0].base64) {
                    identifyImage(result.assets[0].base64);
                } else {
                    setStep('confirm'); // Fallback if no base64
                }
            } else if (!image) {
                // If cancelled and no image, go back
                navigation.goBack();
            }
        } catch (err) {
            console.log('Camera error', err);
            // Fallback to gallery
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.5,
                base64: true,
            });
            if (!res.canceled) {
                setImage(res.assets[0].uri);
                setImageBase64(res.assets[0].base64 || null);
                if (res.assets[0].base64) identifyImage(res.assets[0].base64);
            }
        }
    };

    const identifyImage = async (b64: string) => {
        setStep('predicting');
        try {
            const name = await api.identifyByProduct(b64);
            setPredictedName(name);
            setFinalName(name);
            setStep('confirm');
        } catch (error) {
            console.error(error);
            setPredictedName('Không rõ');
            setStep('confirm');
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            await api.createByProduct({
                name: finalName, // Use the identified type as the name for now
                type: finalName,
                location: locationCoords,
                imageBase64: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Lỗi', 'Không tạo được đống ủ');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'predicting') {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
                <Text style={[styles.textLarge, { marginTop: 20 }]}>🔍 Đang nhìn kỹ...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholder]} />
                )}
                <TouchableOpacity style={styles.retakeBtn} onPress={pickImage}>
                    <Text style={styles.btnTextSmall}>📸 Chụp lại</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.headerText}>Bác xác nhận giùm:</Text>

            {/* AI Prediction Result */}
            <TouchableOpacity
                style={[styles.bigButton, styles.primaryBtn]}
                onPress={handleCreate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.btnLabel}>Phải cái này không?</Text>
                        <Text style={styles.btnValue}>{predictedName || 'Chọn bên dưới 👇'}</Text>
                    </>
                )}
            </TouchableOpacity>

            <Text style={styles.dividerText}>Hoặc là...</Text>

            {/* Fallback Grid */}
            <View style={styles.grid}>
                {FALLBACK_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.value}
                        style={[
                            styles.gridItem,
                            finalName === cat.value && styles.selectedGridItem
                        ]}
                        onPress={() => {
                            setFinalName(cat.value);
                            setPredictedName(cat.value);
                        }}
                    >
                        {/* You would use an icon lib here, using Text for simplicity */}
                        <Text style={{ fontSize: 32 }}>
                            {cat.icon === 'grass' ? '🌾' :
                                cat.icon === 'fish' ? '🐟' :
                                    cat.icon === 'flower-tulip' ? '🌿' : '💩'}
                        </Text>
                        <Text style={styles.gridLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            { /* Manual Input Button if needed - Simplified out for now per design request */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { justifyContent: 'center', alignItems: 'center' },
    imageContainer: {
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#eee',
        position: 'relative',
    },
    image: { width: '100%', height: '100%' },
    placeholder: { backgroundColor: '#ddd' },
    retakeBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    headerText: {
        ...FarmerTheme.typography.header,
        marginBottom: 16,
        textAlign: 'center',
    },
    textLarge: {
        ...FarmerTheme.typography.subHeader,
    },
    bigButton: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
    },
    primaryBtn: {
        backgroundColor: FarmerTheme.colors.primary,
        borderWidth: 2,
        borderColor: '#1B5E20',
    },
    btnLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 18,
        marginBottom: 4,
    },
    btnValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    btnTextSmall: { color: '#fff', fontWeight: 'bold' },
    dividerText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#666',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedGridItem: {
        borderColor: FarmerTheme.colors.accent,
        backgroundColor: '#FFF8E1',
    },
    gridLabel: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
});
