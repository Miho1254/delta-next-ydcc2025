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
            const context = await getContextForAI();

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
    // Timeline is usually [Oldest, ..., Newest] from backend? 
    // Wait, typical Prisma `include: { timeline: true }` returns in creation order.
    // So the LAST element is the newest.
    // Let's find the last message where role === 'model'.
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
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    accessibilityLabel="Quay lại"
                >
                    <Text style={{ fontSize: 24, color: '#162210' }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>Bác Sĩ Cây Trồng Khuyên</Text>
                    {timeline.filter(t => t.role === 'model').length > 1 && (
                        <Text style={{ fontSize: 12, color: '#888' }}>
                            {timeline.filter(t => t.role === 'model').length} lời khuyên
                        </Text>
                    )}
                </View>
                <View style={{ width: 48 }} />
            </View>

            {/* Main Content Area */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Contextual Image */}
                <View style={styles.imageContainer}>
                    {product.startImageUrl ? (
                        <Image source={{ uri: product.startImageUrl }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 40 }}>🌾</Text>
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

            {/* Bottom Action Area: Sticky */}
            <View style={styles.bottomBar}>
                {/* AI Suggested Questions - Dynamic Selection Mode */}
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>💡 Bác muốn hỏi gì?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                        {suggestedQuestions.map((q, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.suggestionChip, sending && styles.btnDisabled]}
                                onPress={() => handleSend(q)}
                                disabled={sending}
                            >
                                <Text style={styles.suggestionText}>{q}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Primary Success Button */}
                <TouchableOpacity
                    style={[styles.btnSuccess, sending && styles.btnDisabled]}
                    onPress={() => handleSend('Tôi đã làm xong việc này rồi.')}
                    disabled={sending}
                >
                    <View style={styles.btnContent}>
                        {sending ? (
                            <ActivityIndicator size={28} color="#fff" />
                        ) : (
                            <Text style={{ fontSize: 28 }}>👍</Text>
                        )}
                        <Text style={styles.btnTextPrimary}>
                            {sending ? THINKING_MESSAGES[thinkingStep] : 'Tui làm xong rồi'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Custom Question Input */}
                {showInput ? (
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Gõ câu hỏi của bác..."
                            value={customQuestion}
                            onChangeText={setCustomQuestion}
                            onSubmitEditing={() => {
                                if (customQuestion.trim()) {
                                    handleSend(customQuestion);
                                    setCustomQuestion('');
                                    setShowInput(false);
                                    Keyboard.dismiss();
                                }
                            }}
                            returnKeyType="send"
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.sendBtn}
                            onPress={() => {
                                if (customQuestion.trim()) {
                                    handleSend(customQuestion);
                                    setCustomQuestion('');
                                    setShowInput(false);
                                    Keyboard.dismiss();
                                }
                            }}
                        >
                            <Text style={{ fontSize: 24 }}>➡️</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.inputToggle}
                        onPress={() => setShowInput(true)}
                    >
                        <Text style={{ fontSize: 20 }}>✍️</Text>
                        <Text style={styles.inputToggleText}>Hoặc gõ câu hỏi riêng...</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f6' }, // background-light
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(246, 248, 246, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 20,
    },
    backBtn: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 20, fontWeight: 'bold', color: '#121b0d',
    },

    scrollContent: {
        flexGrow: 1, padding: 16, paddingBottom: 160, gap: 24,
    },

    // Image
    imageContainer: {
        width: '100%', aspectRatio: 4 / 3,
        borderRadius: 24, overflow: 'hidden',
        elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
        backgroundColor: '#fff',
    },
    image: { width: '100%', height: '100%' },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)', // Gentle tint
    },

    // Prescription Card
    prescriptionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        minHeight: 200,
        elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20,
        borderLeftWidth: 8, borderLeftColor: FarmerTheme.colors.primary,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
    },
    bgIcon: {
        position: 'absolute', right: -20, bottom: -20,
        fontSize: 120, opacity: 0.1, color: FarmerTheme.colors.primary,
    },
    cardInternal: { zIndex: 10 },
    cardLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    cardIconContainer: {
        backgroundColor: 'rgba(91, 236, 19, 0.1)',
        padding: 8, borderRadius: 20,
    },
    cardLabel: {
        fontSize: 14, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase',
    },
    adviceText: {
        fontSize: 26, fontWeight: 'bold', color: '#0A3305', lineHeight: 36,
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 24, paddingBottom: 32,
        backgroundColor: 'rgba(246, 248, 246, 0.9)', // Fade out bg
        gap: 16,
    },
    btnSuccess: {
        height: 64, borderRadius: 32,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: FarmerTheme.colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
    },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    btnTextPrimary: { fontSize: 20, fontWeight: 'bold', color: '#162210' },

    btnVoice: {
        height: 64, borderRadius: 32,
        backgroundColor: '#FFD700', // Gold
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 5, elevation: 4,
    },
    btnTextSecondary: { fontSize: 20, fontWeight: 'bold', color: '#3d2e05' },
    btnDisabled: { opacity: 0.6 },

    // Suggestion Chips (Selection Mode)
    suggestionsContainer: {
        marginBottom: 8,
    },
    suggestionsLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
    suggestionsScroll: {
        gap: 10,
        paddingRight: 20,
    },
    suggestionChip: {
        backgroundColor: '#FFF8E1',
        borderWidth: 2,
        borderColor: '#FFD700',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 24,
    },
    suggestionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4E00',
    },

    // Text Input (Voice Fallback)
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    inputToggleText: {
        fontSize: 14,
        color: '#666',
    },

});
