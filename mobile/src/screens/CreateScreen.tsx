import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { api } from '../services/api';
import { CreateScreenProps } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FarmerTheme } from '../theme';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Pre-defined categories
const FALLBACK_CATEGORIES = [
    { label: 'Rơm rạ', value: 'Rơm rạ', icon: 'grass' },
    { label: 'Vỏ tôm', value: 'Vỏ tôm', icon: 'fish' },
    { label: 'Lục bình', value: 'Lục bình', icon: 'flower-tulip' },
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

    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        getLocation();
        requestPermission();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                try {
                    const loc = await Location.getCurrentPositionAsync({});
                    setLocationCoords(`${loc.coords.latitude},${loc.coords.longitude}`);
                } catch (e) {
                    console.log("Location error", e)
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: true,
                    skipProcessing: true,
                });

                if (photo) {
                    setImage(photo.uri);
                    setImageBase64(photo.base64 || null);
                    if (photo.base64) identifyImage(photo.base64);
                }
            } catch (error) {
                console.error("Capture Failed", error);
                Alert.alert("Lỗi", "Không chụp được ảnh.");
            }
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: (ImagePicker as any).MediaType.Images,
                allowsEditing: true,
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setImageBase64(result.assets[0].base64 || null);
                if (result.assets[0].base64) identifyImage(result.assets[0].base64);
            }
        } catch (err) {
            Alert.alert("Lỗi", "Không mở được thư viện ảnh");
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
                name: finalName,
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

    const handleRetake = () => {
        setImage(null);
        setImageBase64(null);
        setStep('camera');
    };

    // --- RENDER PHASES ---

    // 1. Loading
    if (step === 'predicting') {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
                <Text style={styles.textLarge}>Đang phân tích hình ảnh...</Text>
            </View>
        );
    }

    // 2. Camera View - Pro Max Overlay
    if (step === 'camera') {
        if (!permission || !permission.granted) {
            return (
                <View style={[styles.container, styles.center]}>
                    <Text style={{ marginBottom: 20 }}>Cần cấp quyền Camera</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.galleryBtn}>
                        <Text style={styles.galleryText}>Cấp quyền</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return (
            <View style={styles.fullScreen}>
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    ref={cameraRef}
                />

                <View style={styles.overlayContainer}>
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <AntDesign name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.instructionBubbleWrapper}>
                        <View style={styles.helperPill}>
                            <Text style={styles.helperText}>Chụp ảnh phụ phẩm cần ủ</Text>
                        </View>
                    </View>

                    <View style={styles.controlsArea}>
                        <TouchableOpacity
                            style={styles.shutterBtnOuter}
                            onPress={takePicture}
                            activeOpacity={0.7}
                        >
                            <View style={styles.shutterBtnInner} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                            <Feather name="image" size={24} color="#000" />
                            <Text style={styles.galleryText}>Thư viện</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // 3. Confirm Screen - Golden Harvest
    if (step === 'confirm') {
        const categories = FALLBACK_CATEGORIES;
        const isValidPrediction = predictedName && predictedName !== 'Không rõ' &&
            categories.some(cat => cat.value === predictedName);
        const suggestedValue = isValidPrediction ? predictedName : null;

        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Header Gradient Block */}
                    <View style={styles.headerBlock}>
                        <View style={styles.confirmTopBar}>
                            <TouchableOpacity
                                style={styles.retakeBtn}
                                onPress={handleRetake}
                            >
                                <Feather name="refresh-cw" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '600' }}>Chụp lại</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Image Card - Negative Margin */}
                    <View style={styles.confirmImageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.confirmImage} />
                        ) : (
                            <View style={[styles.confirmImage, styles.placeholder]} />
                        )}
                        <View style={styles.photoBadge}>
                            <AntDesign name="camera" size={14} color="#fff" />
                            <Text style={styles.photoBadgeText}>ẢNH CHỤP THỰC TẾ</Text>
                        </View>
                    </View>

                    <View style={styles.headlineContainer}>
                        <Text style={styles.headlineTitle}>XÁC NHẬN LOẠI</Text>
                        <Text style={styles.headlineSubtitle}>AI nhận diện đây là {predictedName || "..."}</Text>
                    </View>

                    <View style={styles.gridContainer}>
                        {categories.map((cat) => {
                            const isSuggested = cat.value === suggestedValue;
                            const isSelected = finalName === cat.value;

                            return (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.optionCard,
                                        isSuggested ? styles.cardSuggested : styles.cardNormal,
                                        isSelected && !isSuggested ? styles.cardSelectedManual : {}
                                    ]}
                                    onPress={() => setFinalName(cat.value)}
                                    activeOpacity={0.9}
                                >
                                    {isSuggested && (
                                        <View style={styles.aiBadge}>
                                            <Text style={styles.aiBadgeText}>AI GỢI Ý</Text>
                                        </View>
                                    )}

                                    <View style={[
                                        styles.iconCircle,
                                        // Selected -> Gold/White, Normal -> Grey
                                        isSuggested || isSelected ? styles.iconCircleSelected : styles.iconCircleNormal
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={cat.icon as any}
                                            size={32}
                                            color={isSuggested || isSelected ? FarmerTheme.colors.primary : '#434343'}
                                        />
                                    </View>

                                    <Text style={[
                                        styles.optionLabel,
                                        isSuggested || isSelected ? styles.labelSelected : styles.labelNormal
                                    ]}>
                                        {cat.label}
                                    </Text>

                                    {isSelected && (
                                        <View style={styles.checkIcon}>
                                            <AntDesign name="check-circle" size={24} color={FarmerTheme.colors.success} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.stickyFooter}>
                    <TouchableOpacity
                        style={styles.confirmBtnFull}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#ffffff" /> : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Text style={styles.confirmBtnText}>XÁC NHẬN & TẠO</Text>
                                <AntDesign name="arrow-right" size={24} color="#ffffff" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    fullScreen: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Overlay
    overlayContainer: { flex: 1, justifyContent: 'space-between', padding: 24, paddingTop: Platform.OS === 'android' ? 44 : 60 },
    topBar: { alignItems: 'flex-start' },
    closeBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    },
    instructionBubbleWrapper: { alignItems: 'center' },
    helperPill: {
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 50,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },
    helperText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
    controlsArea: { alignItems: 'center', gap: 32, paddingBottom: 32 },
    shutterBtnOuter: {
        width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#fff',
        justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)'
    },
    shutterBtnInner: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#fff' },
    galleryBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, gap: 8, elevation: 3
    },
    galleryText: { fontSize: 16, fontWeight: '700', color: '#000' },

    textLarge: { ...FarmerTheme.typography.subHeader, marginTop: 20, textAlign: 'center' },

    // Confirm UI
    headerBlock: {
        height: 120, alignItems: 'flex-end', justifyContent: 'flex-start',
        backgroundColor: '#262626', // Dark backing for image blend
    },
    confirmTopBar: {
        width: '100%',
        flexDirection: 'row', justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'android' ? 44 : 54, paddingHorizontal: 20,
        zIndex: 10,
    },
    retakeBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center'
    },
    confirmImageContainer: {
        height: Dimensions.get('window').height * 0.4,
        marginTop: 0,
        marginHorizontal: 0,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        overflow: 'hidden', backgroundColor: '#262626', position: 'relative'
    },
    confirmImage: { width: '100%', height: '100%' },
    photoBadge: {
        position: 'absolute', bottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
        backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8,
    },
    photoBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 1 },

    // Content
    headlineContainer: { padding: 24, paddingBottom: 16, alignItems: 'center' },
    headlineTitle: { fontSize: 24, fontWeight: '800', color: FarmerTheme.colors.text, textAlign: 'center', letterSpacing: 0.5 },
    headlineSubtitle: { fontSize: 16, color: FarmerTheme.colors.textSecondary, marginTop: 4, textAlign: 'center' },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingHorizontal: 16 },
    optionCard: {
        width: '45%', aspectRatio: 1, borderRadius: 20, // Softer corners
        padding: 12, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#f0f0f0', backgroundColor: '#fff',
        position: 'relative',
        ...FarmerTheme.shadows.card, // Pro Max Shadows
    },
    cardNormal: {},
    cardSuggested: {
        backgroundColor: FarmerTheme.colors.accentLight, // Gold tint
        borderColor: FarmerTheme.colors.accent, borderWidth: 2,
    },
    cardSelectedManual: {
        borderColor: FarmerTheme.colors.primary, borderWidth: 2,
    },

    aiBadge: {
        position: 'absolute', top: -10, backgroundColor: FarmerTheme.colors.accent, // Gold
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, elevation: 2,
        shadowColor: FarmerTheme.colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4
    },
    aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    iconCircleNormal: { backgroundColor: '#f5f5f5' },
    iconCircleSelected: { backgroundColor: '#fff' },

    optionLabel: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
    labelNormal: { color: FarmerTheme.colors.textSecondary },
    labelSelected: { color: FarmerTheme.colors.primary },

    checkIcon: { position: 'absolute', bottom: 8, right: 8 },

    // Footer
    stickyFooter: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 16, paddingBottom: 24,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10
    },
    confirmBtnFull: {
        backgroundColor: FarmerTheme.colors.primary, height: 60, borderRadius: 30, // Big button
        alignItems: 'center', justifyContent: 'center',
        elevation: 6, shadowColor: FarmerTheme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10
    },
    confirmBtnText: { fontSize: 18, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },

    placeholder: { backgroundColor: '#eee' },
});
