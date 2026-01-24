import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { api, TimelineEntry } from '../services/api';
import { getContextForAI } from '../services/ContextService';
import { ChatScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';
import * as Speech from 'expo-speech';

// "Digital Manual" Style - No user chat bubbles
export default function ChatScreen({ route }: ChatScreenProps) {
    const { byproductId, name } = route.params;
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Filter to show only AI messages in the main view (User intent is implied)
    // Actually, we might want to show user question as a small "Topic" header above the card?
    // Design says: "User: Do NOT show user chat bubbles. Just show a status 'Bác đang hỏi...'."

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchTimeline();
        // fetchContext(); // Context is handled by backend or refreshed when sending
    }, [byproductId]);

    const fetchTimeline = async () => {
        try {
            const response = await api.getByProduct(byproductId);
            setTimeline(response.timeline.reverse());
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
            const payload = {
                text: text,
                contextString: context.fullContext,
            };
            const response = await api.chat(byproductId, payload);
            setTimeline(response.timeline.reverse());
        } catch (error) {
            Alert.alert('Lỗi', 'Không gửi được câu hỏi.');
        } finally {
            setSending(false);
        }
    };

    const handleVoiceInput = () => {
        // Mock voice input for now
        Alert.alert('Đang nghe...', 'Bác nói đi...', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Gửi "Cần làm gì tiếp?"', onPress: () => handleSend('Tôi cần làm gì tiếp theo?') },
            { text: 'Gửi "Có cần tưới nước?"', onPress: () => handleSend('Đống ủ có cần tưới nước không?') }
        ]);
    };

    const renderCard = ({ item }: { item: TimelineEntry }) => {
        if (item.role === 'user') {
            // Option: Hide user messages completely or show as small divider
            return (
                <View style={styles.userActionContainer}>
                    <Text style={styles.userActionText}>Bác đã hỏi: "{item.content}"</Text>
                </View>
            );
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>💡 Hướng dẫn</Text>
                    <IconButton icon="volume-high" size={24} onPress={() => Speech.speak(item.content)} />
                </View>

                <Text style={styles.cardContent}>{item.content}</Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.citation}>Nguồn: Viện Lúa ĐBSCL</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>{name}</Text>
                {sending && <Text style={styles.statusText}>... AI đang soạn thảo ...</Text>}
            </View>

            <FlatList
                ref={flatListRef}
                data={timeline}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                inverted={true} // Show latest at bottom? No, 'Digital Manual' usually reads top down.
            // Actually timeline is reversed in state, so index 0 is newest. 
            // Let's keep standard order for a manual? 
            // If it's a history of instructions, usually latest is most relevant.
            // Let's stick to latest (bottom) but since I reversed it in fetchTimeline...
            // Wait, previous code: setTimeline(response.timeline.reverse()); 
            // Usually convenient for Chat (inverted).
            // Let's use Inverted for easy "scroll to bottom".
            />

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => handleSend('Xong việc rồi!')}>
                    <Text style={styles.actionBtnTextSec}>👍 Xong việc</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.micBtn} onPress={handleVoiceInput}>
                    <Text style={{ fontSize: 30 }}>🎙️</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => handleSend('Ngoài ra...')}>
                    <Text style={styles.actionBtnTextSec}>❓ Hỏi khác</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E0E0E0' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: {
        backgroundColor: FarmerTheme.colors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        elevation: 4,
    },
    topBarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statusText: {
        color: 'yellow',
        marginTop: 4,
        fontStyle: 'italic',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    userActionContainer: {
        alignSelf: 'center',
        marginVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    userActionText: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: FarmerTheme.colors.primary,
    },
    cardContent: {
        fontSize: 20, // Large text for farmers
        lineHeight: 30,
        color: '#333',
    },
    cardFooter: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    citation: {
        fontSize: 14,
        color: '#888',
    },
    actionBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        elevation: 8,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    micBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        borderWidth: 4,
        borderColor: FarmerTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40, // Float up
        elevation: 10,
    },
    actionBtnSecondary: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f0f2f5',
    },
    actionBtnTextSec: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
