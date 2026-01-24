import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, NativeModules, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api, ByProduct } from '../services/api';
import { HomeScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';

// Generic placeholders for Stitch Design look & feel
// In a real app, these would be local assets or CDN links.
const PLACEHOLDER_IMAGES = {
    straw: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQOx5vumrM2uxU_D_PIesNEByQHLuQwnXAzvXeJC5KXfDT9Yb5ar_9ShtP3g8cO1CUvCiPkR7o-KTRKmw_5hs1hU20RkkSFQjXdeKNV1KOCUmoh_Bm11vtGEKsccO7daK577OJVcOhXE1etOMw0vkEu3Y5Px2OEkBEp33gzNvX8IaSzJR3XnMpEGS5Lwm3gPylcepoUEnXDKBU9GGMOJ1cnaNeUr8o2Vf6nHbQnWKENhLa96x9W49EjM2aYp_RKwwFv-GSKn6mVpE',
    shrimp: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-OD8x0u7NDxSPrm7hYvLZLYmsR7FSBSFvLGAy-wKJ5B8pB0Gs-kJa_j90sLJGWYCF0TSXQ8uYrjHK7K5BW_NRyZc9Mc0uY4s-J4ymFsxN266zzW2tGkLm9AVAoS7DF7ukJFiDi7vb95orjm0r9DauRkgt7nJ2mhLvjFRrbq4fMaJ_yE87cZTv0kDJmSw5RmDsKAY2Mkr8YO34Um_zoXVYe0oZKfbvczcX2__sMKBQnFUUb7rZldPwqElmqNuw044wcDJi_JenGMs',
    hyacinth: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1VD4oskBVXWUsU2UtJpJyfiQ0zeU1akxCDqla1oNzA1bcSU0HoJPzWXPIihcplocsvUJCuiLmjVv9UAOYySViGXYf4OshzimYTXw2BfYmszL6PFF2OjY55PVmxQuu_5UEbWH-0nTvuLSqNkuM7JfP8G8erwywVT1beAWz9eGn92wfLHoDVQTZbr0JmefehwNNcG2ukTAEUDoF4BVvSXzD3Wfxz4nRw1LODopcmSRo0FbMZbVsyKdDOSAQagRV2nNlT7T59WIG8Z4',
    default: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2940&auto=format&fit=crop',
};

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

    const getImageForType = (type: string) => {
        const lower = type.toLowerCase();
        if (lower.includes('rơm') || lower.includes('straw')) return PLACEHOLDER_IMAGES.straw;
        if (lower.includes('tôm') || lower.includes('shrimp')) return PLACEHOLDER_IMAGES.shrimp;
        if (lower.includes('lục bình') || lower.includes('bèo') || lower.includes('hyacinth')) return PLACEHOLDER_IMAGES.hyacinth;
        return PLACEHOLDER_IMAGES.default;
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ready_to_harvest':
                return {
                    label: 'Đã xong',
                    icon: '✅',
                    bgColor: FarmerTheme.colors.primary,
                    textColor: '#162210'
                };
            case 'processing':
                return {
                    label: 'Đang ủ',
                    icon: '⏳',
                    bgColor: '#FFF59D', // Yellow 200
                    textColor: '#F57F17' // Yellow 900
                };
            default:
                return {
                    label: 'Mới tạo',
                    icon: '🆕',
                    bgColor: '#E1F5FE',
                    textColor: '#0288D1'
                };
        }
    };

    const renderItem = ({ item }: { item: ByProduct }) => {
        const hasUserImage = !!item.startImageUrl;
        const displayImage = hasUserImage ? item.startImageUrl : getImageForType(item.type);
        const status = getStatusInfo(item.status);
        const date = new Date(item.createdAt).toLocaleDateString('vi-VN');

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Chat', { byproductId: item.id, name: item.name })}
                activeOpacity={0.95}
            >
                {/* Image Background */}
                <Image source={{ uri: displayImage }} style={styles.cardBg} />

                {/* Gradient Overlay (Simulated with semi-transparent view) */}
                <View style={styles.cardOverlay} />

                {/* Status Badge - Absolute Top Right (or Bottom Left per Stitch) */}
                {/* Stitch has it Bottom Left of image but ours is full card bg. Let's follow Stitch: Bottom Left of Image Area */}

                <View style={styles.cardContentContainer}>
                    {/* Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                        <Text style={[styles.statusText, { color: status.textColor }]}>
                            {status.icon} {status.label}
                        </Text>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.cardSubtitle}>Cập nhật: {date}</Text>
                    </View>

                    {/* Icon Circle */}
                    <View style={styles.iconCircle}>
                        <Text style={{ fontSize: 32 }}>🌱</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={FarmerTheme.colors.primary} />
                <Text style={styles.loadingText}>Đang tải việc...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={FarmerTheme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Việc Nhà Nông</Text>
                <Text style={styles.headerSubtitle}>Hôm nay, bác khỏe không?</Text>
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
                        <Text style={{ fontSize: 80, marginBottom: 20 }}>🌾</Text>
                        <Text style={styles.emptyText}>Chưa có việc nào!</Text>
                        <Text style={styles.emptyHint}>Bấm nút dấu cộng ở dưới đi bác.</Text>
                    </View>
                }
            />

            {/* Massive FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Create')}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: FarmerTheme.colors.background },

    // Header
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: '#fff', // Or slightly transparent
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        ...FarmerTheme.typography.header,
        color: '#162210',
    },
    headerSubtitle: {
        fontSize: 18,
        color: '#888',
        fontWeight: '500',
        marginTop: 4,
    },

    list: { padding: 20, paddingBottom: 140 },

    // Card
    card: {
        height: 250,
        borderRadius: FarmerTheme.roundness,
        marginBottom: 24,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 8, // Deep shadow
        shadowColor: '#5bec13', // Green shadow tint
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        position: 'relative',
    },
    cardBg: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(22, 34, 16, 0.4)', // Dark overlay for text contrast
        // Ideally a gradient from transparent (top) to black (bottom)
    },

    cardContentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
    },

    // Status Badge
    statusBadge: {
        position: 'absolute',
        top: 24,
        left: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 16,
    },

    textContainer: {
        marginBottom: 8,
        marginRight: 80, // Space for icon
    },
    cardTitle: {
        fontSize: 32, // Giant
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    cardSubtitle: {
        fontSize: 18,
        color: '#e0e0e0',
        fontWeight: '500',
    },

    iconCircle: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State
    emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
    emptyText: { ...FarmerTheme.typography.subHeader, color: '#8da38a' },
    emptyHint: { fontSize: 18, color: '#aaa', marginTop: 8 },

    // Loading
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 18, color: '#666' },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: FarmerTheme.colors.primary,
        shadowOpacity: 0.6,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        borderWidth: 4,
        borderColor: '#fff',
    },
    fabIcon: {
        fontSize: 50,
        color: '#162210',
        fontWeight: '300',
        marginTop: -4,
    },
});
