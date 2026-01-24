import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { api, TimelineEntry, AIAnalysis } from '../services/api';

interface ChatScreenProps {
    route: {
        params: {
            byproductId: string;
            name: string;
        };
    };
}

export default function ChatScreen({ route }: ChatScreenProps) {
    const { byproductId, name } = route.params;
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchTimeline();
    }, [byproductId]);

    const fetchTimeline = async () => {
        try {
            const response = await api.getByProduct(byproductId);
            setTimeline(response.timeline.reverse());

            // Get suggested questions from last model message
            const lastModelMessage = response.timeline.find(t => t.role === 'model');
            if (lastModelMessage?.metadata?.suggestedQuestions) {
                setSuggestedQuestions(lastModelMessage.metadata.suggestedQuestions);
            }
        } catch (error) {
            console.error('Fetch timeline error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        setSending(true);
        setInput('');

        try {
            const response = await api.chat(byproductId, { text: text.trim() });
            setTimeline(response.timeline.reverse());

            if (response.analysis.suggestedQuestions) {
                setSuggestedQuestions(response.analysis.suggestedQuestions);
            }

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: TimelineEntry }) => (
        <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.modelBubble
        ]}>
            <Text style={[
                styles.messageText,
                item.role === 'user' ? styles.userText : styles.modelText
            ]}>
                {item.content}
            </Text>
            <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={timeline}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                ListHeaderComponent={
                    <Text style={styles.headerText}>Chat với AI về: {name}</Text>
                }
            />

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>Gợi ý:</Text>
                    <View style={styles.suggestionsRow}>
                        {suggestedQuestions.slice(0, 3).map((q, i) => (
                            <Chip
                                key={i}
                                onPress={() => handleSend(q)}
                                style={styles.suggestionChip}
                                textStyle={styles.suggestionText}
                            >
                                {q}
                            </Chip>
                        ))}
                    </View>
                </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Hỏi AI về đống ủ..."
                    style={styles.input}
                    mode="outlined"
                    disabled={sending}
                />
                <IconButton
                    icon={sending ? 'loading' : 'send'}
                    size={28}
                    onPress={() => handleSend(input)}
                    disabled={sending || !input.trim()}
                    iconColor="#2e7d32"
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        padding: 16,
        paddingBottom: 8,
    },
    headerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    userBubble: {
        backgroundColor: '#2e7d32',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    modelBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        elevation: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: 'white',
    },
    modelText: {
        color: '#333',
    },
    timestamp: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        textAlign: 'right',
    },
    suggestionsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    suggestionsLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    suggestionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionChip: {
        backgroundColor: '#e8f5e9',
    },
    suggestionText: {
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        marginRight: 8,
        maxHeight: 100,
    },
});
