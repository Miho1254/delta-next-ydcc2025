import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Dimensions, Platform, TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { api, TimelineEntry, ByProduct } from '../services/api';
import { getContextForAI } from '../services/ContextService';
import { ChatScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';
import * as Speech from 'expo-speech';

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
    const { byproductId, name } = route.params;
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [product, setProduct] = useState<ByProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [customQuestion, setCustomQuestion] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [thinkingStep, setThinkingStep] = useState(0);

    // Smart thinking messages to mask rate limits
    const THINKING_MESSAGES = [
        "Đang đọc câu hỏi...",
        "Đang tra cứu thời tiết khu vực...",
        "Đang phân tích điều kiện ủ...",
        "Đang tổng hợp kinh nghiệm vùng...",
        "Đang viết câu trả lời chi tiết..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sending) {
            setThinkingStep(0);
            interval = setInterval(() => {
                setThinkingStep(prev => (prev + 1) % THINKING_MESSAGES.length);
            }, 3000); // Change message every 3s
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
            // Filter only AI messages for the "Prescription" view if we want to be strict,
            // or just use the whole timeline. Usage: The latest AI message is the "Advice".
            setTimeline(response.timeline);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (text: string) => {
        setSending(true);
        try {
            const context = await getContextForAI(product ? { createdAt: product.createdAt } : undefined);

            // Build rich context for smarter AI prompts
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
                // GPS location data for precise localization
                gps: context.gps ? {
                    latitude: context.gps.latitude,
                    longitude: context.gps.longitude,
                    province: context.gps.province,
                    district: context.gps.district,
                    commune: context.gps.commune,
                    fullAddress: context.gps.fullAddress,
                } : undefined,
                timeline: context.timeline,
            };

            const payload = {
                text: text,
                contextString: context.fullContext,
                richContext,
            };
            const response = await api.chat(byproductId, payload);
            setTimeline(response.timeline); // API returns updated timeline

            // If user said "Done", maybe go back or show success?
            if (text.includes('xong')) {
                Alert.alert("Hoan hô!", "Bác giỏi quá! Đã cập nhật trạng thái.", [
                    { text: "Về trang chủ", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không gửi được.');
        } finally {
            setSending(false);
        }
    };

    if (loading || !product) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
            </View>
        );
    }

    // Get the latest AI message to display as "The Advice"
    const latestAdvice = [...timeline].reverse().find(t => t.role === 'model');
    const adviceText = latestAdvice ? latestAdvice.content : "Đang chờ bác sĩ xem xét...";

    // Extract AI-suggested questions from latest advice metadata
    const suggestedQuestions: string[] = latestAdvice?.metadata?.suggestedQuestions || [
        'Có cần tưới nước không?',
        'Bao lâu nữa thu hoạch?',
        'Cần đảo đống không?',
    ];

    return (
        <View style={styles.container}>
            {/* Header Section: Premium & Friendly */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    accessibilityLabel="Quay lại"
                >
                    <Text style={{ fontSize: 24, color: FarmerTheme.colors.primaryDark }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.headerTitle, { color: FarmerTheme.colors.primaryDark }]}>BÁC SĨ CÂY TRỒNG</Text>
                    <View style={styles.doctorBadge}>
                        <Text style={{ fontSize: 12, color: FarmerTheme.colors.surface, fontWeight: 'bold' }}>
                            Trợ lý AI 24/7
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.menuBtn}>
                    <Text style={{ fontSize: 24 }}>⋮</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content Area */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Contextual Image: Premium Card */}
                <View style={styles.imageContainer}>
                    {product.startImageUrl ? (
                        <Image source={{ uri: product.startImageUrl }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.fallbackImageContainer]}>
                            <Text style={{ fontSize: 50 }}>🌱</Text>
                            <Text style={{ marginTop: 8, color: FarmerTheme.colors.textSecondary, fontWeight: '600' }}>
                                Đang phân tích mẫu ủ...
                            </Text>
                        </View>
                    )}
                    <View style={styles.imageOverlay} />
                </View>

                {/* Advice Card: The "Prescription" */}
                <View style={styles.prescriptionCard}>
                    {/* Background Icon Decoration */}
                    <Text style={styles.bgIcon}>🌿</Text>

                    <View style={styles.cardInternal}>
                        <View style={styles.cardLabelRow}>
                            <View style={styles.cardIconContainer}>
                                <Text style={{ fontSize: 20 }}>⚕️</Text>
                            </View>
                            <Text style={styles.cardLabel}>LỜI KHUYÊN</Text>
                            <TouchableOpacity onPress={() => Speech.speak(adviceText)} style={{ marginLeft: 'auto' }}>
                                <Text style={{ fontSize: 24 }}>🔊</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.adviceText}>
                            "{adviceText}"
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Interaction Area: Safe & Clean */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                style={styles.bottomWrapper}
            >
                {/* Suggestions: Horizontal Scroll Above Input */}
                {!sending && (
                    <View style={styles.suggestionsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                            {suggestedQuestions.map((q, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.suggestionChip}
                                    onPress={() => handleSend(q)}
                                >
                                    <Text style={styles.suggestionText}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Primary Action Button (Smart Thinking State) */}
                <View style={styles.footerContainer}>
                    {sending ? (
                        <View style={styles.thinkingContainer}>
                            <ActivityIndicator size={24} color={FarmerTheme.colors.primary} />
                            <Text style={styles.thinkingText}>{THINKING_MESSAGES[thinkingStep]}</Text>
                        </View>
                    ) : (
                        showInput ? (
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Đặt câu hỏi khác..."
                                    placeholderTextColor={FarmerTheme.colors.placeholder}
                                    value={customQuestion}
                                    onChangeText={setCustomQuestion}
                                    onSubmitEditing={() => customQuestion.trim() && handleSend(customQuestion)}
                                    returnKeyType="send"
                                    autoFocus
                                />
                                <TouchableOpacity
                                    style={styles.sendBtn}
                                    onPress={() => customQuestion.trim() && handleSend(customQuestion)}
                                >
                                    <Text style={{ fontSize: 20, color: 'white' }}>⬆️</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.defaultActions}>
                                <TouchableOpacity
                                    style={styles.btnInputToggle}
                                    onPress={() => setShowInput(true)}
                                >
                                    <Text style={{ fontSize: 20 }}>⌨️</Text>
                                    <Text style={styles.inputToggleText}>Nhập câu hỏi</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.btnSuccess}
                                    onPress={() => handleSend('Tôi đã làm xong việc này rồi.')}
                                >
                                    <View style={styles.btnContent}>
                                        <Text style={{ fontSize: 24 }}>👍</Text>
                                        <Text style={styles.btnTextPrimary}>Đã làm xong</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Styles Refined for Premium Feel
    container: { flex: 1, backgroundColor: FarmerTheme.colors.background }, // Use theme background
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        paddingTop: Platform.OS === 'android' ? 48 : 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: FarmerTheme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
        zIndex: 20,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: FarmerTheme.colors.background,
    },
    menuBtn: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18, fontWeight: '800',
        letterSpacing: 0.5, textTransform: 'uppercase',
    },
    doctorBadge: {
        backgroundColor: FarmerTheme.colors.primary,
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 12, marginTop: 4,
    },

    scrollContent: {
        flexGrow: 1, padding: 20, paddingBottom: 180, gap: 24,
    },

    // Image
    imageContainer: {
        width: '100%', aspectRatio: 16 / 9,
        borderRadius: 24, overflow: 'hidden',
        elevation: 6, shadowColor: FarmerTheme.colors.primaryDark, shadowOpacity: 0.15, shadowRadius: 15,
        backgroundColor: '#fff',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    image: { width: '100%', height: '100%' },
    fallbackImageContainer: {
        backgroundColor: FarmerTheme.colors.primaryLight,
        justifyContent: 'center', alignItems: 'center',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },

    // Prescription Card (Medical Style)
    prescriptionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 28,
        minHeight: 220,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
        borderTopWidth: 4, borderTopColor: FarmerTheme.colors.primary, // Medical notepad style
        position: 'relative', overflow: 'hidden',
    },
    bgIcon: {
        position: 'absolute', right: -30, bottom: -30,
        fontSize: 140, opacity: 0.04, color: FarmerTheme.colors.text,
    },
    cardInternal: { zIndex: 10 },
    cardLabelRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12,
        borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12,
    },
    cardIconContainer: {
        backgroundColor: FarmerTheme.colors.primaryLight,
        padding: 8, borderRadius: 12,
    },
    cardLabel: {
        fontSize: 13, fontWeight: '800', color: FarmerTheme.colors.textSecondary,
        letterSpacing: 1.5, textTransform: 'uppercase', flex: 1,
    },
    adviceText: {
        fontSize: 18, fontWeight: '500', color: FarmerTheme.colors.text,
        lineHeight: 30, letterSpacing: -0.2,
    },

    // Bottom Wrapper
    bottomWrapper: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'transparent',
    },
    suggestionsContainer: {
        marginBottom: 12,
    },
    suggestionsScroll: {
        gap: 12, paddingHorizontal: 20,
    },
    suggestionChip: {
        backgroundColor: FarmerTheme.colors.surface,
        borderWidth: 1, borderColor: FarmerTheme.colors.primaryLight,
        paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    suggestionText: {
        fontSize: 14, fontWeight: '600', color: FarmerTheme.colors.primaryDark,
    },

    footerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        paddingHorizontal: 24, paddingTop: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20,
    },

    // Default Actions Row
    defaultActions: {
        flexDirection: 'row', gap: 16,
    },
    btnInputToggle: {
        width: 60, height: 60, borderRadius: 20,
        backgroundColor: FarmerTheme.colors.background,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#eee',
    },
    inputToggleText: { fontSize: 10, color: '#888', marginTop: 4, fontWeight: '600' },

    btnSuccess: {
        flex: 1, height: 60, borderRadius: 20,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: FarmerTheme.colors.primary, shadowOpacity: 0.3, shadowRadius: 8,
    },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    btnTextPrimary: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    btnDisabled: { opacity: 0.6 },

    // Thinking State
    thinkingContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        height: 50,
    },
    thinkingText: {
        fontSize: 16, color: FarmerTheme.colors.primary, fontWeight: '600',
        fontStyle: 'italic',
    },

    // Input Row
    inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    textInput: {
        flex: 1, height: 50, backgroundColor: FarmerTheme.colors.background,
        borderRadius: 16, paddingHorizontal: 16, fontSize: 16,
        borderWidth: 1, borderColor: FarmerTheme.colors.primaryLight,
        color: FarmerTheme.colors.text,
    },
    sendBtn: {
        width: 50, height: 50, borderRadius: 16,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },

});
