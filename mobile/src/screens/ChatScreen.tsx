import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { TextInput, Text, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { api, TimelineEntry } from '../services/api';
import { ChatScreenProps } from '../types/navigation';

export default function ChatScreen({ route }: ChatScreenProps) {
    const { byproductId, name } = route.params;
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchTimeline();
    }, [byproductId]);

    const fetchTimeline = async () => {
        try {
            const response = await api.getByProduct(byproductId);
            setTimeline(response.timeline.reverse());

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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim() && !imageBase64) return;

        setSending(true);
        setInput('');

        try {
            const payload = {
                text: text.trim(),
                imageBase64: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined
            };
            const response = await api.chat(byproductId, payload);

            // Reset image after sending
            setSelectedImage(null);
            setImageBase64(null);

            setTimeline(response.timeline.reverse());

            if (response.analysis.suggestedQuestions) {
                setSuggestedQuestions(response.analysis.suggestedQuestions);
            }

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Chat error:', error);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setSending(false);
        }
    };

    const handleVoiceInput = () => {
        Alert.alert(
            '🎤 Nhập giọng nói',
            'Tính năng nhập giọng nói đang được phát triển.\n\nHãy sử dụng các gợi ý bên dưới hoặc gõ câu hỏi.',
            [{ text: 'OK' }]
        );
    };

    const speakResponse = (text: string) => {
        Speech.speak(text, {
            language: 'vi-VN',
            rate: 0.9,
        });
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
            {item.metadata?.imageUrl && (
                <Image
                    source={{ uri: item.metadata.imageUrl }}
                    style={styles.messageImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.messageFooter}>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                </Text>
                {item.role === 'model' && (
                    <IconButton
                        icon="volume-high"
                        size={16}
                        onPress={() => speakResponse(item.content)}
                        iconColor="#666"
                    />
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
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
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có tin nhắn</Text>
                        <Text style={styles.emptyHint}>Hãy hỏi AI về đống ủ của bác!</Text>
                    </View>
                }
            />

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>Gợi ý cho bác:</Text>
                    <View style={styles.suggestionsRow}>
                        {suggestedQuestions.slice(0, 3).map((q, i) => (
                            <Chip
                                key={i}
                                onPress={() => handleSend(q)}
                                style={styles.suggestionChip}
                                textStyle={styles.suggestionText}
                                disabled={sending}
                            >
                                {q}
                            </Chip>
                        ))}
                    </View>
                </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <IconButton
                    icon="microphone"
                    size={24}
                    onPress={handleVoiceInput}
                    iconColor={isListening ? '#f44336' : '#2e7d32'}
                    disabled={sending}
                />
                <IconButton
                    icon="camera"
                    size={24}
                    onPress={pickImage}
                    iconColor={selectedImage ? '#2e7d32' : '#666'}
                    disabled={sending}
                />
                <View style={{ flex: 1 }}>
                    {selectedImage && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.previewThumb} />
                            <IconButton
                                icon="close-circle"
                                size={16}
                                onPress={() => { setSelectedImage(null); setImageBase64(null); }}
                                style={styles.removePreview}
                            />
                        </View>
                    )}
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Hỏi AI về đống ủ..."
                        style={styles.input}
                        mode="outlined"
                        disabled={sending}
                        onSubmitEditing={() => handleSend(input)}
                    />
                </View>
                <IconButton
                    icon={sending ? 'loading' : 'send'}
                    size={24}
                    onPress={() => handleSend(input)}
                    disabled={sending || (!input.trim() && !selectedImage)}
                    iconColor="#2e7d32"
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, color: '#666' },
    messageList: { padding: 16, paddingBottom: 8, flexGrow: 1 },
    headerText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
    emptyText: { fontSize: 16, color: '#666' },
    emptyHint: { fontSize: 14, color: '#999', marginTop: 8 },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
    userBubble: { backgroundColor: '#2e7d32', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    modelBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: 'white' },
    modelText: { color: '#333' },
    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    timestamp: { fontSize: 10, color: '#999' },
    suggestionsContainer: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
    suggestionsLabel: { fontSize: 12, color: '#2e7d32', fontWeight: '600', marginBottom: 8 },
    suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    suggestionChip: { backgroundColor: '#e8f5e9' },
    suggestionText: { fontSize: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
    input: { flex: 1, maxHeight: 100 },
    messageImage: { width: 200, height: 150, borderRadius: 8, marginBottom: 8 },
    previewContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    previewThumb: { width: 40, height: 40, borderRadius: 4, marginRight: 8 },
    removePreview: { position: 'absolute', top: -10, right: -10, margin: 0 },
});
