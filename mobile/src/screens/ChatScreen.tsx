import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Dimensions, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { api, TimelineEntry, ByProduct } from '../services/api';
import { getContextForAI } from '../services/ContextService';
import { ChatScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Placeholder Images - Same as HomeScreen for consistency
const PLACEHOLDER_IMAGES = {
    straw: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQOx5vumrM2uxU_D_PIesNEByQHLuQwnXAzvXeJC5KXfDT9Yb5ar_9ShtP3g8cO1CUvCiPkR7o-KTRKmw_5hs1hU20RkkSFQjXdeKNV1KOCUmoh_Bm11vtGEKsccO7daK577OJVcOhXE1etOMw0vkEu3Y5Px2OEkBEp33gzNvX8IaSzJR3XnMpEGS5Lwm3gPylcepoUEnXDKBU9GGMOJ1cnaNeUr8o2Vf6nHbQnWKENhLa96x9W49EjM2aYp_RKwwFv-GSKn6mVpE',
    shrimp: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-OD8x0u7NDxSPrm7hYvLZLYmsR7FSBSFvLGAy-wKJ5B8pB0Gs-kJa_j90sLJGWYCF0TSXQ8uYrjHK7K5BW_NRyZc9Mc0uY4s-J4ymFsxN266zzW2tGkLm9AVAoS7DF7ukJFiDi7vb95orjm0r9DauRkgt7nJ2mhLvjFRrbq4fMaJ_yE87cZTv0kDJmSw5RmDsKAY2Mkr8YO34Um_zoXVYe0oZKfbvczcX2__sMKBQnFUUb7rZldPwqElmqNuw044wcDJi_JenGMs',
    hyacinth: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1VD4oskBVXWUsU2UtJpJyfiQ0zeU1akxCDqla1oNzA1bcSU0HoJPzWXPIihcplocsvUJCuiLmjVv9UAOYySViGXYf4OshzimYTXw2BfYmszL6PFF2OjY55PVmxQuu_5UEbWH-0nTvuLSqNkuM7JfP8G8erwywVT1beAWz9eGn92wfLHoDVQTZbr0JmefehwNNcG2ukTAEUDoF4BVvSXzD3Wfxz4nRw1LODopcmSRo0FbMZbVsyKdDOSAQagRV2nNlT7T59WIG8Z4',
    default: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2940&auto=format&fit=crop',
};

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
    const { byproductId, name } = route.params;
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [product, setProduct] = useState<ByProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [thinkingStep, setThinkingStep] = useState(0);

    const THINKING_MESSAGES = [
        "Đang phân tích dữ liệu...",
        "Tra cứu thời tiết khu vực...",
        "So sánh biểu đồ nhiệt độ...",
        "Tổng hợp lời khuyên...",
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sending) {
            setThinkingStep(0);
            interval = setInterval(() => {
                setThinkingStep(prev => (prev + 1) % THINKING_MESSAGES.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [sending]);

    useEffect(() => {
        fetchData();
    }, [byproductId]);

    const fetchData = async () => {
        try {
            const response = await api.getByProduct(byproductId);
            setProduct(response.byproduct);
            setTimeline(response.timeline);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getImageForType = (type: string) => {
        const lower = type.toLowerCase();
        if (lower.includes('rơm') || lower.includes('straw')) return PLACEHOLDER_IMAGES.straw;
        if (lower.includes('tôm') || lower.includes('shrimp')) return PLACEHOLDER_IMAGES.shrimp;
        if (lower.includes('lục bình') || lower.includes('bèo') || lower.includes('hyacinth')) return PLACEHOLDER_IMAGES.hyacinth;
        return PLACEHOLDER_IMAGES.default;
    };

    const handleSend = async (text?: string, imageBase64?: string) => {
        if (!text && !imageBase64) return;

        // Haptic Feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Optimistic UI: Immediately show user message
        const optimisticMessage: TimelineEntry = {
            id: `temp-${Date.now()}`,
            byproductId,
            timestamp: Date.now(),
            role: 'user',
            content: text || '',
            metadata: imageBase64 ? {
                hasImage: true,
                imageUrl: imageBase64 // Store raw base64 here so the render loop picks it up
            } : {},
        };

        setTextInput('');

        setSending(true);
        try {
            const context = await getContextForAI(product ? { createdAt: product.createdAt } : undefined);
            const richContext = {
                location: context.location,
                weather: context.weather,
                regionName: context.regionProfile?.name,
                climateZone: context.regionProfile?.climateZone,
                soilType: context.regionProfile?.soilType,
                regionTips: context.regionProfile?.compostingTips,
                rainAlert: context.forecast?.rainAlert,
                tempAdvice: context.forecast?.tempAdvice,
                warnings: context.composting?.warnings,
                gps: context.gps,
                timeline: context.timeline,
            };

            const payload = {
                text: text,
                imageBase64: imageBase64,
                contextString: context.fullContext,
                richContext,
            };
            const response = await api.chat(byproductId, payload);
            setTimeline(response.timeline);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra lại mạng.');
        } finally {
            setSending(false);
        }
    };

    const pickImage = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                Alert.alert(
                    "Gửi ảnh",
                    "Bạn muốn gửi ảnh này cho Bác sĩ cây trồng?",
                    [
                        { text: "Hủy", style: "cancel" },
                        { text: "Gửi ngay", onPress: () => handleSend(undefined, result.assets[0].base64 || undefined) }
                    ]
                );
            }
        } catch (err) {
            Alert.alert("Lỗi", "Không mở được thư viện ảnh");
        }
    };

    if (loading || !product) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
                <Text style={{ marginTop: 16, color: FarmerTheme.colors.textSecondary }}>Đang tải hồ sơ...</Text>
            </View>
        );
    }

    const latestAdvice = [...timeline].reverse().find(t => t.role === 'model');
    const adviceText = latestAdvice ? latestAdvice.content : "Đang chờ phân tích...";
    const displayImage = product.startImageUrl || getImageForType(product.type);

    const suggestedQuestions: string[] = latestAdvice?.metadata?.suggestedQuestions || [
        'Cần tưới thêm nước không?',
        'Khi nào thì đảo trộn?',
        'Có mùi hôi phải làm sao?',
    ];

    return (
        <View style={styles.container}>
            {/* Header: Pro Max Style */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>BÁC SĨ CÂY TRỒNG</Text>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Trực tuyến 24/7</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.menuBtn}>
                    <Feather name="more-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Keyboard Handling Container */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    // Maintain scroll position when keyboard opens
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Product File Card - "Medical Record" style */}
                    <View style={styles.recordCard}>
                        <View style={styles.recordHeader}>
                            <Feather name="file-text" size={16} color={FarmerTheme.colors.primary} />
                            <Text style={styles.recordLabel}>HỒ SƠ ĐỐNG Ủ</Text>
                        </View>
                        <View style={styles.recordBody}>
                            <Image
                                source={{ uri: displayImage }}
                                style={styles.recordImage}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.recordName}>{product.name}</Text>
                                <Text style={styles.recordMeta}>
                                    {product.type} • {product.location}
                                </Text>
                                <View style={styles.recordStatus}>
                                    <Text style={styles.recordStatusText}>Tình trạng: Ổn định</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Main Chat Flow - Render FULL History */}
                    <View style={styles.chatSection}>
                        {timeline.map((entry) => {
                            const isUser = entry.role === 'user';
                            const hasImage = entry.metadata && typeof entry.metadata === 'object' && 'imageUrl' in entry.metadata;
                            let imageUrl = hasImage ? (entry.metadata as any).imageUrl : null;
                            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                                imageUrl = `data:image/jpeg;base64,${imageUrl}`;
                            }

                            return (
                                <View key={entry.id} style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
                                    {!isUser && (
                                        <View style={styles.aiAvatar}>
                                            <MaterialCommunityIcons name="robot" size={24} color="#fff" />
                                        </View>
                                    )}

                                    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                                        {!isUser && (
                                            <View style={styles.aiBubbleHeader}>
                                                <Text style={styles.aiName}>Trợ lý AI</Text>
                                                <TouchableOpacity onPress={() => Speech.speak(entry.content)}>
                                                    <Feather name="volume-2" size={16} color={FarmerTheme.colors.accent} />
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {isUser && imageUrl && (
                                            <Image
                                                source={{ uri: imageUrl }}
                                                style={styles.chatImage}
                                                resizeMode="cover"
                                            />
                                        )}

                                        {entry.content ? (
                                            <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
                                                {entry.content}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Input Area - No longer absolute, just bottom of Flex column */}
                <View style={styles.inputWrapper}>
                    {/* Suggestions */}
                    {!sending && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                            {suggestedQuestions.map((q, i) => (
                                <TouchableOpacity key={i} style={styles.chip} onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleSend(q);
                                }}>
                                    <Text style={styles.chipText}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <View style={styles.inputBar}>
                        {sending ? (
                            <View style={styles.thinkingBox}>
                                <ActivityIndicator size={20} color={FarmerTheme.colors.primary} />
                                <Text style={styles.thinkingText}>{THINKING_MESSAGES[thinkingStep]}</Text>
                            </View>
                        ) : (
                            <>
                                {/* Text Input (Left) */}
                                <View style={styles.inputContainer}>
                                    <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                                        <AntDesign name="camera" size={24} color={FarmerTheme.colors.textSecondary} />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Hỏi gì đi..."
                                        placeholderTextColor={FarmerTheme.colors.placeholder}
                                        value={textInput}
                                        onChangeText={setTextInput}
                                        returnKeyType="send"
                                        onSubmitEditing={() => textInput.trim() && handleSend(textInput)}
                                    />
                                </View>

                                {/* BIG MIC BUTTON (Center/Right) */}
                                {!textInput.trim() ? (
                                    <TouchableOpacity
                                        style={styles.bigMicBtn}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            Alert.alert("Giọng nói", "Đang nghe... (Demo: Tự điền 'Tưới nước mấy lần?')", [
                                                { text: "Huỷ" },
                                                { text: "OK", onPress: () => setTextInput("Tưới nước mấy lần một ngày?") }
                                            ]);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="microphone" size={32} color="#fff" />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.sendBtn}
                                        onPress={() => textInput.trim() && handleSend(textInput)}
                                    >
                                        <MaterialCommunityIcons name="send" size={24} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: FarmerTheme.colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header - Pro Max Deep Emerald
    header: {
        paddingTop: Platform.OS === 'android' ? 44 : 54,
        paddingBottom: 16, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: FarmerTheme.colors.primary,
        zIndex: 10,
        ...FarmerTheme.shadows.card,
    },
    backBtn: { padding: 8 },
    menuBtn: { padding: 8 },
    headerInfo: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#52c41a' },
    onlineText: { fontSize: 10, color: '#fff', fontWeight: '600' },

    scrollContent: { padding: 16, paddingBottom: 20 },

    // Record Card
    recordCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4, borderLeftColor: FarmerTheme.colors.accent, // Gold accent
        ...FarmerTheme.shadows.card,
    },
    recordHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
    recordLabel: { fontSize: 12, fontWeight: '700', color: FarmerTheme.colors.textSecondary, letterSpacing: 1 },
    recordBody: { flexDirection: 'row', gap: 16 },
    recordImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f5f5f5' },
    recordName: { fontSize: 18, fontWeight: '700', color: FarmerTheme.colors.text, marginBottom: 4 },
    recordMeta: { fontSize: 14, color: FarmerTheme.colors.textSecondary, marginBottom: 4 },
    recordStatus: { alignSelf: 'flex-start', backgroundColor: '#f6ffed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#b7eb8f' },
    recordStatusText: { fontSize: 10, fontWeight: '700', color: '#389e0d' },

    // Chat
    chatSection: { gap: 16 },
    bubbleWrapper: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    userWrapper: { flexDirection: 'row-reverse' },
    aiWrapper: { alignItems: 'flex-start' },

    aiAvatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 2,
    },

    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    aiBubble: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 4,
        ...FarmerTheme.shadows.card,
    },
    userBubble: {
        backgroundColor: FarmerTheme.colors.primary,
        borderTopRightRadius: 4,
    },

    aiBubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    aiName: { fontSize: 10, fontWeight: '700', color: FarmerTheme.colors.primary, textTransform: 'uppercase' },

    bubbleText: { fontSize: 15, lineHeight: 22, color: FarmerTheme.colors.text },
    userBubbleText: { color: '#fff' },

    chatImage: {
        width: 200, height: 200, borderRadius: 12,
        marginBottom: 8, backgroundColor: '#eee'
    },

    aiText: { fontSize: 16, lineHeight: 26, color: FarmerTheme.colors.text },

    // Input - Layout Block (Not Absolute)
    inputWrapper: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: -6 }
    },
    chipScroll: { paddingHorizontal: 16, marginBottom: 12 },
    chip: {
        backgroundColor: FarmerTheme.colors.accentLight,
        paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, marginRight: 8,
        borderWidth: 1, borderColor: '#ffe58f'
    },
    chipText: { color: '#d48806', fontWeight: '700', fontSize: 13 },

    inputBar: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12,
        justifyContent: 'space-between'
    },

    // Group Attach + Input check
    inputContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f5f5f5', borderRadius: 28,
        paddingHorizontal: 8, paddingVertical: 4,
        height: 56, // Taller for touch targets
    },

    attachBtn: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        borderRadius: 20, marginRight: 4
    },

    textInput: {
        flex: 1, height: '100%',
        fontSize: 16, color: FarmerTheme.colors.text,
    },

    sendBtn: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: FarmerTheme.colors.primary, // Green Send
        justifyContent: 'center', alignItems: 'center',
        elevation: 4,
    },

    bigMicBtn: {
        width: 64, height: 64, borderRadius: 32, // SUPER BIG as requested
        backgroundColor: FarmerTheme.colors.accent, // Gold Mic
        justifyContent: 'center', alignItems: 'center',
        elevation: 8, shadowColor: FarmerTheme.colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
        marginBottom: 4, // Lift slightly
    },

    disabledSend: { backgroundColor: '#d9d9d9', elevation: 0 },

    thinkingBox: {
        flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#f9f9f9', borderRadius: 28, borderWidth: 1, borderColor: '#eee'
    },
    thinkingText: { fontSize: 14, color: FarmerTheme.colors.textSecondary, fontStyle: 'italic' },
});
