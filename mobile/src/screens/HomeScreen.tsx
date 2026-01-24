import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, NativeModules, TouchableOpacity, Image } from 'react-native';
import { FAB, Title, Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api, ByProduct } from '../services/api';
import { HomeScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const [byproducts, setByproducts] = useState<ByProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchByProducts = async () => {
        try {
            const response = await api.getByProducts();
            setByproducts(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchByProducts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchByProducts();
    };

    const renderItem = ({ item }: { item: ByProduct }) => {
        const hasImage = !!item.startImageUrl;
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Chat', { byproductId: item.id, name: item.name })}
                activeOpacity={0.9}
            >
                {/* Thumbnail Image */}
                <View style={styles.cardImageContainer}>
                    {hasImage ? (
                        <Image source={{ uri: item.startImageUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]} >
                            <Text style={{ fontSize: 30 }}>🌱</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusIcon}>
                            {item.status === 'ready_to_harvest' ? '✅' : '⏳'}
                        </Text>
                        <Text style={styles.cardStatus}>
                            {item.status === 'ready_to_harvest' ? 'Xong rồi!' : 'Đang ủ...'}
                        </Text>
                    </View>
                    <Text style={styles.cardType}>{item.type}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Việc Nhà Nông</Text>
                <Text style={styles.headerSubtitle}>Chào bác Ba! Hôm nay làm gì?</Text>
            </View>

            <FlatList
                data={byproducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[FarmerTheme.colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ fontSize: 60, marginBottom: 20 }}>🌾</Text>
                        <Text style={styles.emptyText}>Chưa có việc nào hết trơn!</Text>
                        <Text style={styles.emptyHint}>Bấm dấu cộng ở dưới để bắt đầu nha.</Text>
                    </View>
                }
            />

            {/* Massive FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Create')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: FarmerTheme.typography.header,
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, color: '#666', fontSize: 18 },
    list: { padding: 16, paddingBottom: 120 },

    // Card Styles
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 16,
        padding: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    cardImageContainer: {
        marginRight: 16,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    placeholderImage: {
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        ...FarmerTheme.typography.subHeader,
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    cardStatus: {
        fontSize: 16,
        color: '#555',
        fontWeight: 'bold',
    },
    cardType: {
        fontSize: 14,
        color: '#888',
    },


    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyText: { ...FarmerTheme.typography.subHeader, textAlign: 'center', marginBottom: 8 },
    emptyHint: { fontSize: 18, color: '#777', textAlign: 'center', paddingHorizontal: 32 },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    fabIcon: {
        color: '#fff',
        fontSize: 48,
        lineHeight: 52, // Adjust for centering
        fontWeight: '300',
    },
});
