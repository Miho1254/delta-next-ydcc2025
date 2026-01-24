import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { api } from '../services/api';
import { CreateScreenProps } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Use new CameraView
import { FarmerTheme } from '../theme';

// Pre-defined categories for fallback or correction
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

    // Camera Refs
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
                    skipProcessing: true, // Speed up
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
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, // Maybe disable strict crop for Stitch feel? Let's keep it for now.
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

    // 1. Loading / Predicting
    if (step === 'predicting') {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
                <Text style={[styles.textLarge, { marginTop: 20 }]}>🔍 Đang nhìn kỹ...</Text>
            </View>
        );
    }

    // 2. Camera View (Stitch Design)
    if (step === 'camera') {
        if (!permission || !permission.granted) {
            return (
                <View style={styles.center}>
                    <Text style={{ marginBottom: 20 }}>Cần cấp quyền Camera để dùng tính năng này</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.galleryBtn}>
                        <Text>Cấp quyền</Text>
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

                {/* Overlay UI */}
                <View style={styles.overlayContainer}>
                    {/* Top Bar: Close */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={{ fontSize: 30, color: '#000' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Speech Bubble Instruction */}
                    <View style={styles.instructionBubbleWrapper}>
                        <View style={styles.instructionBubble}>
                            <Text style={styles.instructionText}>
                                Chụp cái đống bác muốn xử lý lại gần chút nhen!
                            </Text>
                            {/* Triangle Tail */}
                            <View style={styles.bubbleTail} />
                        </View>
                        <View style={styles.helperPill}>
                            <Text style={styles.helperText}>Canh chỉnh camera vào đống phụ phẩm</Text>
                        </View>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.controlsArea}>
                        {/* Shutter Button */}
                        <TouchableOpacity style={styles.shutterBtnOuter} onPress={takePicture}>
                            <View style={styles.shutterBtnInner} />
                        </TouchableOpacity>

                        {/* Gallery Button */}
                        <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                            {/* Mock Icon */}
                            <Text style={{ fontSize: 24 }}>🖼️</Text>
                            <Text style={styles.galleryText}>Chọn ảnh có sẵn</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // 3. Confirm Screen (Updated Style - Stitch Identification)
    if (step === 'confirm') {
        const categories = FALLBACK_CATEGORIES;
        // Determine which one is "Suggested" (matches prediction)
        // If prediction is "Không rõ" or empty, don't highlight any card as suggested
        const isValidPrediction = predictedName && predictedName !== 'Không rõ' &&
            categories.some(cat => cat.value === predictedName);
        const suggestedValue = isValidPrediction ? predictedName : null;

        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Top App Bar Overlay (Absolute) */}
                    <View style={styles.confirmTopBar}>
                        <TouchableOpacity
                            style={styles.retakeBtn}
                            onPress={handleRetake}
                            accessibilityLabel="Chụp lại ảnh"
                        >
                            <Text style={{ fontSize: 16, color: '#fff', marginLeft: 4 }}>↺ Chụp lại</Text>
                        </TouchableOpacity>
                        <Text style={styles.confirmTitle}>Agri-Loop</Text>
                        <View style={{ width: 80 }} />
                    </View>

                    {/* Captured Photo Section */}
                    <View style={styles.confirmImageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.confirmImage} />
                        ) : (
                            <View style={[styles.confirmImage, styles.placeholder]} />
                        )}
                        <View style={styles.photoBadge}>
                            <Text style={styles.photoBadgeText}>Ảnh của Bác</Text>
                        </View>
                    </View>

                    {/* Headline */}
                    <View style={styles.headlineContainer}>
                        <Text style={styles.headlineTitle}>Bác chọn loại nào?</Text>
                        <Text style={styles.headlineSubtitle}>Máy đã tự chọn cái đúng nhất cho Bác</Text>
                    </View>

                    {/* Selection Grid */}
                    <View style={styles.gridContainer}>
                        {categories.map((cat) => {
                            const isSuggested = cat.value === suggestedValue;
                            const isSelected = finalName === cat.value;

                            // Style logic:
                            // If isSuggested: distinct gold/yellow style.
                            // If isSelected (manually): border highlight.
                            // For simplicity, we make the "Suggested" one look special initially.
                            // And "Selected" overrides border.

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
                                            <Text style={styles.aiBadgeText}>✨ Gợi ý</Text>
                                        </View>
                                    )}

                                    <View style={[
                                        styles.iconCircle,
                                        isSuggested ? styles.iconCircleSuggested : styles.iconCircleNormal
                                    ]}>
                                        <Text style={{ fontSize: 32 }}>
                                            {cat.icon === 'grass' ? '🌾' :
                                                cat.icon === 'fish' ? '🐟' :
                                                    cat.icon === 'flower-tulip' ? '🌿' : '💩'}
                                        </Text>
                                    </View>

                                    <Text style={[
                                        styles.optionLabel,
                                        isSuggested ? styles.labelSuggested : styles.labelNormal
                                    ]}>
                                        {cat.label}
                                    </Text>

                                    {isSelected && (
                                        <View style={styles.checkIcon}>
                                            <Text style={{ fontSize: 24, color: isSuggested ? '#F57F17' : FarmerTheme.colors.primary }}>✅</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Bottom Sticky Action Bar */}
                <View style={styles.stickyFooter}>
                    <TouchableOpacity
                        style={styles.confirmBtnFull}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#162210" /> : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.confirmBtnText}>Xác nhận</Text>
                                <Text style={styles.confirmBtnSub}>(Confirm)</Text>
                                <Text style={{ fontSize: 24, marginLeft: 8 }}>→</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return null; // Should not reach
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfdfa' },
    fullScreen: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // --- Camera Overlay ---
    overlayContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 60,
    },
    topBar: { alignItems: 'flex-start' },
    closeBtn: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 4
    },
    instructionBubbleWrapper: { alignItems: 'center' },
    instructionBubble: {
        backgroundColor: '#fff', padding: 20, borderRadius: 24,
        borderWidth: 3, borderColor: 'rgba(91, 236, 19, 0.4)',
        maxWidth: 280, position: 'relative', elevation: 6, marginBottom: 16
    },
    instructionText: {
        ...FarmerTheme.typography.subHeader,
        fontSize: 20, textAlign: 'center', color: '#000'
    },
    bubbleTail: {
        position: 'absolute', bottom: -16, left: '50%', marginLeft: -10,
        backgroundColor: 'transparent', borderTopWidth: 16, borderTopColor: '#fff',
        borderLeftWidth: 12, borderLeftColor: 'transparent',
        borderRightWidth: 12, borderRightColor: 'transparent'
    },
    helperPill: {
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 50,
    },
    helperText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    controlsArea: { alignItems: 'center', gap: 24, paddingBottom: 20 },
    shutterBtnOuter: {
        width: 90, height: 90, borderRadius: 45, borderWidth: 5, borderColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: FarmerTheme.colors.primary, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8
    },
    shutterBtnInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff' },
    galleryBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 10, elevation: 3
    },
    galleryText: { fontSize: 16, fontWeight: 'bold', color: '#000' },

    textLarge: { ...FarmerTheme.typography.subHeader, marginTop: 20 },

    // --- Confirm Screen Styles ---
    confirmTopBar: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 10, paddingHorizontal: 20,
    },
    backBtnCircle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center', alignItems: 'center'
    },
    retakeBtn: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    confirmTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textShadowRadius: 4, textShadowColor: '#000' },

    confirmImageContainer: {
        height: Dimensions.get('window').height * 0.45,
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        overflow: 'hidden', backgroundColor: '#333',
        position: 'relative'
    },
    confirmImage: { width: '100%', height: '100%' },
    photoBadge: {
        position: 'absolute', bottom: 20, alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8,
        borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
    },
    photoBadgeText: { color: '#fff', fontSize: 16, fontWeight: '500' },

    headlineContainer: { padding: 24, alignItems: 'center' },
    headlineTitle: { fontSize: 32, fontWeight: '800', color: '#162210', textAlign: 'center' },
    headlineSubtitle: { fontSize: 18, color: '#666', marginTop: 8, textAlign: 'center' },

    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingHorizontal: 16
    },
    optionCard: {
        width: '45%', aspectRatio: 1, borderRadius: 24,
        padding: 16, alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    cardNormal: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
    cardSuggested: {
        backgroundColor: '#FFFDE7', // Yellow 50
        borderColor: '#FFD600', borderWidth: 4,
        shadowColor: '#FFD600', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10
    },
    cardSelectedManual: {
        borderColor: FarmerTheme.colors.primary, borderWidth: 4,
    },

    aiBadge: {
        position: 'absolute', top: -12, backgroundColor: '#FFD600',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, elevation: 2
    },
    aiBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },

    iconCircle: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12
    },
    iconCircleNormal: { backgroundColor: '#f5f5f5' },
    iconCircleSuggested: { backgroundColor: '#FFEE58' },

    optionLabel: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    labelNormal: { color: '#444' },
    labelSuggested: { color: '#000' },

    checkIcon: { position: 'absolute', bottom: 8, right: 8 },

    // Footer
    stickyFooter: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#eee',
        elevation: 20
    },
    confirmBtnFull: {
        backgroundColor: FarmerTheme.colors.primary, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
        shadowColor: FarmerTheme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8
    },
    confirmBtnText: { fontSize: 20, fontWeight: 'bold', color: '#162210' },
    confirmBtnSub: { fontSize: 14, color: '#162210', opacity: 0.7, marginLeft: 6 },

    placeholder: { backgroundColor: '#eee' },
});
