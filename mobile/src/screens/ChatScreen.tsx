import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Dimensions, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { api, TimelineEntry, ByProduct } from '../services/api';
import { getContextForAI } from '../services/ContextService';
import { ChatScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
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
    const [customQuestion, setCustomQuestion] = useState('');
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
        } catch (error) {
            Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra lại mạng.');
        } finally {
            setSending(false);
            setCustomQuestion('');
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: (ImagePicker as any).MediaType.Images,
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
                    <AntDesign name="arrow-left" size={24} color="#fff" />
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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                {/* Main Chat Flow */}
                <View style={styles.chatSection}>
                    {/* Advice Bubble (AI) */}
                    <View style={styles.aiContainer}>
                        <View style={styles.aiAvatar}>
                            <MaterialCommunityIcons name="robot" size={24} color="#fff" />
                        </View>
                        <View style={styles.aiBubble}>
                            <View style={styles.aiBubbleHeader}>
                                <Text style={styles.aiName}>Trợ lý AI</Text>
                                <TouchableOpacity onPress={() => Speech.speak(adviceText)}>
                                    <Feather name="volume-2" size={18} color={FarmerTheme.colors.accent} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.aiText}>{adviceText}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Input Area - Floating Sheet */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                style={styles.inputWrapper}
            >
                {/* Suggestions */}
                {!sending && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {suggestedQuestions.map((q, i) => (
                            <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(q)}>
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
                            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                                <AntDesign name="plus" size={24} color={FarmerTheme.colors.textSecondary} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nhập câu hỏi..."
                                placeholderTextColor={FarmerTheme.colors.placeholder}
                                value={customQuestion}
                                onChangeText={setCustomQuestion}
                                returnKeyType="send"
                                onSubmitEditing={() => customQuestion.trim() && handleSend(customQuestion)}
                            />
                            <TouchableOpacity
                                style={[styles.sendBtn, !customQuestion.trim() && styles.disabledSend]}
                                onPress={() => customQuestion.trim() && handleSend(customQuestion)}
                                disabled={!customQuestion.trim()}
                            >
                                <MaterialCommunityIcons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}
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
        ...FarmerTheme.shadows.card,
    },
    backBtn: { padding: 8 },
    menuBtn: { padding: 8 },
    headerInfo: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#52c41a' },
    onlineText: { fontSize: 10, color: '#fff', fontWeight: '600' },

    scrollContent: { padding: 16, paddingBottom: 160 }, // Space for input

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
    chatSection: {},
    aiContainer: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    aiAvatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 2,
    },
    aiBubble: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16, borderTopLeftRadius: 4,
        padding: 16,
        ...FarmerTheme.shadows.card,
    },
    aiBubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    aiName: { fontSize: 12, fontWeight: '700', color: FarmerTheme.colors.primary, textTransform: 'uppercase' },
    aiText: { fontSize: 16, lineHeight: 26, color: FarmerTheme.colors.text },

    // Input - Floating
    inputWrapper: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        elevation: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }
    },
    chipScroll: { paddingHorizontal: 16, marginBottom: 16 },
    chip: {
        backgroundColor: FarmerTheme.colors.accentLight,
        paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, marginRight: 8,
        borderWidth: 1, borderColor: '#ffe58f'
    },
    chipText: { color: '#d48806', fontWeight: '700', fontSize: 13 },

    inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
    attachBtn: { padding: 4 },
    textInput: {
        flex: 1, height: 48,
        backgroundColor: '#f5f5f5', borderRadius: 24,
        paddingHorizontal: 20, fontSize: 16,
        color: FarmerTheme.colors.text,
    },
    sendBtn: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 4,
    },
    disabledSend: { backgroundColor: '#d9d9d9', elevation: 0 },

    thinkingBox: {
        flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#f9f9f9', borderRadius: 24, borderWidth: 1, borderColor: '#eee'
    },
    thinkingText: { fontSize: 14, color: FarmerTheme.colors.textSecondary, fontStyle: 'italic' },
});
