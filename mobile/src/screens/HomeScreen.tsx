import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, Platform, StatusBar, Dimensions, DeviceEventEmitter, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api, ByProduct } from '../services/api';
import { HomeScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Placeholder Images - High Res for Pro Max
const PLACEHOLDER_IMAGES = {
    straw: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQOx5vumrM2uxU_D_PIesNEByQHLuQwnXAzvXeJC5KXfDT9Yb5ar_9ShtP3g8cO1CUvCiPkR7o-KTRKmw_5hs1hU20RkkSFQjXdeKNV1KOCUmoh_Bm11vtGEKsccO7daK577OJVcOhXE1etOMw0vkEu3Y5Px2OEkBEp33gzNvX8IaSzJR3XnMpEGS5Lwm3gPylcepoUEnXDKBU9GGMOJ1cnaNeUr8o2Vf6nHbQnWKENhLa96x9W49EjM2aYp_RKwwFv-GSKn6mVpE',
    shrimp: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-OD8x0u7NDxSPrm7hYvLZLYmsR7FSBSFvLGAy-wKJ5B8pB0Gs-kJa_j90sLJGWYCF0TSXQ8uYrjHK7K5BW_NRyZc9Mc0uY4s-J4ymFsxN266zzW2tGkLm9AVAoS7DF7ukJFiDi7vb95orjm0r9DauRkgt7nJ2mhLvjFRrbq4fMaJ_yE87cZTv0kDJmSw5RmDsKAY2Mkr8YO34Um_zoXVYe0oZKfbvczcX2__sMKBQnFUUb7rZldPwqElmqNuw044wcDJi_JenGMs',
    hyacinth: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1VD4oskBVXWUsU2UtJpJyfiQ0zeU1akxCDqla1oNzA1bcSU0HoJPzWXPIihcplocsvUJCuiLmjVv9UAOYySViGXYf4OshzimYTXw2BfYmszL6PFF2OjY55PVmxQuu_5UEbWH-0nTvuLSqNkuM7JfP8G8erwywVT1beAWz9eGn92wfLHoDVQTZbr0JmefehwNNcG2ukTAEUDoF4BVvSXzD3Wfxz4nRw1LODopcmSRo0FbMZbVsyKdDOSAQagRV2nNlT7T59WIG8Z4',
    default: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2940&auto=format&fit=crop',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const [byproducts, setByproducts] = useState<ByProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchByProducts = async () => {
        try {
            const response = await api.getByProducts();
            setByproducts(response.data);
        } catch (error: any) {
            console.error('Fetch error:', error);
            if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                DeviceEventEmitter.emit('auth.logout');
            }
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
                    label: 'THU HOẠCH NGAY',
                    iconName: 'check-circle',
                    color: FarmerTheme.colors.success,
                    bgColor: '#f6ffed',
                };
            case 'processing':
                return {
                    label: 'ĐANG Ủ',
                    iconName: 'clock-circle',
                    color: FarmerTheme.colors.accent,
                    bgColor: FarmerTheme.colors.accentLight,
                };
            default:
                return {
                    label: 'MỚI TẠO',
                    iconName: 'plus-circle',
                    color: FarmerTheme.colors.primary,
                    bgColor: FarmerTheme.colors.primaryLight,
                };
        }
    };

    const renderItem = ({ item }: { item: ByProduct, index: number }) => {
        const hasUserImage = !!item.startImageUrl;
        const displayImage = hasUserImage ? item.startImageUrl : getImageForType(item.type);
        const status = getStatusInfo(item.status);
        const date = new Date(item.createdAt).toLocaleDateString('vi-VN');

        // Pro Max Fix: Square Aspect Ratio (1:1) to avoid "too tall" look
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Chat', { byproductId: item.id, name: item.name })}
                activeOpacity={0.9} // Snappy
            >
                <View style={[styles.imageContainer, { aspectRatio: 1 }]}>
                    <Image source={{ uri: displayImage }} style={styles.cardImage} />

                    {/* Pro Max High Contrast Pill */}
                    <View style={[styles.statusPill, { borderColor: status.color }]}>
                        <AntDesign name={status.iconName as any} size={14} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.metaRow}>
                        <Feather name="calendar" size={14} color={FarmerTheme.colors.textSecondary} />
                        <Text style={styles.cardSubtitle}>{date}</Text>
                    </View>

                    <View style={styles.actionRow}>
                        <Text style={styles.typeTag}>{item.type}</Text>
                        <View style={styles.arrowBtn}>
                            <Feather name="arrow-right" size={20} color={FarmerTheme.colors.primary} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Feather name="layers" size={60} color={FarmerTheme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đống ủ nào</Text>
            <Text style={styles.emptyDesc}>Hãy chụp ảnh phụ phẩm để bắt đầu ủ phân hữu cơ ngay hôm nay.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Create')}>
                <Text style={styles.emptyBtnText}>TẠO MỚI NGAY</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    // Logout Function
    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bác muốn thoát tài khoản à?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: () => DeviceEventEmitter.emit('auth.logout')
            }
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={{ color: FarmerTheme.colors.primary }}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={FarmerTheme.colors.primary} />

            {/* Pro Max Header: Deep Emerald Block with Decoration */}
            <View style={styles.header}>
                {/* Visual Depth: Decorative Circle */}
                <View style={styles.headerDecoration} />

                <TouchableOpacity style={{ padding: 4 }} onPress={handleLogout}>
                    <Feather name="log-out" size={24} color={FarmerTheme.colors.primaryLight} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerEyebrow}>XIN CHÀO BÁC,</Text>
                    <Image
                        source={require('../../assets/splash-icon.png')}
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />
                </View>
                <TouchableOpacity
                    style={styles.marketBtn}
                    onPress={() => navigation.navigate('Market')}
                >
                    <AntDesign name="shopping-cart" size={24} color={FarmerTheme.colors.primary} />
                    <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
                <FlatList
                    data={byproducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', gap: 16 }}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[FarmerTheme.colors.accent]}
                            tintColor={FarmerTheme.colors.accent}
                        />
                    }
                    ListEmptyComponent={EmptyState}
                />
            </View>

            {/* Pro Max FAB: Floating Gold Action */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Create')}
                activeOpacity={0.8}
            >
                <AntDesign name="plus" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: FarmerTheme.colors.background },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },

    // Header - Deep Emerald with Visual Depth
    header: {
        paddingTop: Platform.OS === 'android' ? 44 : 60,
        paddingBottom: 40, // Increased spacing
        paddingHorizontal: 24,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        backgroundColor: FarmerTheme.colors.primary,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden', // Clip decorations
    },
    // Decorative Circle for "Look and Feel"
    headerDecoration: {
        position: 'absolute', top: -50, right: -50,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
        zIndex: -1,
    },

    headerEyebrow: {
        fontSize: 14, fontWeight: '700', color: FarmerTheme.colors.primaryLight,
        letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase'
    },

    // Logo Header: Just Logo
    logoContainer: {
        justifyContent: 'center', alignItems: 'flex-start',
    },
    headerLogo: {
        width: 180, height: 60, // Enlarge as requested
    },

    marketBtn: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        ...FarmerTheme.shadows.float,
    },
    badge: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: FarmerTheme.colors.accent,
        width: 20, height: 20, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
    },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },

    // Content: Overlap the header
    contentContainer: {
        flex: 1,
        marginTop: -20, // Pull up to overlap header
        borderTopLeftRadius: 0,
    },
    list: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 },

    // Card - Floating Glass-like (simulated)
    card: {
        width: (SCREEN_WIDTH - 32 - 16) / 2, // 2 columns with 16 gap
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        ...FarmerTheme.shadows.card,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    },
    imageContainer: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    cardImage: { width: '100%', height: '100%' },

    // Status Pill
    statusPill: {
        position: 'absolute', top: 12, left: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingVertical: 6, paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1,
        elevation: 2,
    },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

    cardContent: { padding: 16, backgroundColor: '#fff' },
    cardTitle: {
        ...FarmerTheme.typography.subHeader,
        fontSize: 18, lineHeight: 24, marginBottom: 8,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    cardSubtitle: { fontSize: 14, color: FarmerTheme.colors.textSecondary, fontWeight: '500' },

    actionRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 4,
    },
    typeTag: {
        fontSize: 13, fontWeight: '700', color: FarmerTheme.colors.primary,
        backgroundColor: FarmerTheme.colors.primaryLight,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden'
    },
    arrowBtn: {
        padding: 4,
    },

    // Empty State
    emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
    emptyIconCircle: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: FarmerTheme.colors.primaryLight,
        justifyContent: 'center', alignItems: 'center', marginBottom: 24
    },
    emptyTitle: { ...FarmerTheme.typography.header, fontSize: 24, color: FarmerTheme.colors.text, marginBottom: 12, textAlign: 'center' },
    emptyDesc: { ...FarmerTheme.typography.body, fontSize: 16, color: FarmerTheme.colors.textSecondary, textAlign: 'center', marginBottom: 32 },
    emptyBtn: {
        backgroundColor: FarmerTheme.colors.accent,
        paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        ...FarmerTheme.shadows.float,
    },
    emptyBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

    // FAB
    fab: {
        position: 'absolute', bottom: 32, right: 24,
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: FarmerTheme.colors.accent, // Gold CTA
        justifyContent: 'center', alignItems: 'center',
        ...FarmerTheme.shadows.float,
        borderWidth: 2, borderColor: '#fff'
    },
});
