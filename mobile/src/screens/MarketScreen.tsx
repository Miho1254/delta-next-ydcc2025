import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, FlatList, TextInput, StatusBar, Platform } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import { MarketScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';

// Stitch Dummy Data
const PRODUCTS = [
    {
        id: '1',
        name: 'Phân bón NPK 20-20-15',
        price: '15 ngàn/kg',
        seller: 'Chú Tư Xóm Trên',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjSOR8jE_C1lZzTCWAxOry5i7f8TFjAukabnJsX7Tc_MbqVyaw4xTgaBsTonWxjbfkwsiizDTST96iHbKKkWFqHAjLCChVaIm0OmLbHz1Y6QNASqN7bA3a0tCYfo_WzDi_UtGJHm-RHsJg9ACdKiHoN6MF8tCUw-Gqqcmm8lcrUDelWb3lKZCINkeifW1_B8VBxKdHSYrsQc5tdbFxct-IFdk1hzzZvxDQzT4C1Hh6U-fPD-a4bwlUuzqJOFSLgW2moA7mnpE-FlA',
        badge: 'HOT',
        badgeColor: '#d32f2f',
    },
    {
        id: '2',
        name: 'Lúa giống ST25 (Bao 10kg)',
        price: '20 ngàn/kg',
        seller: 'Dì Năm Hậu Giang',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHazqnNCxTai1UiVlWujIgBWrIq9bAYC3VlexQ-y18ORwMGDS3MlDsl2zU8DrqPhWl268H938M48KAxyVQgDnO6dS8P46_C4l--mKSYj-27rU6GGsogxdpoyjL59QobZzRSMj5FS1OQOhEcsh71ueOdIE_TuRHvrfX6tLlokxswckcb6vrXDr4dNYZZL_E5JbH_SRAZqSh8rcSLp6CxYwDca3Q0hjawizrT3QM4iVtJVSRrnSEqQkjEl-cFlHbxOkK6z7Yt7oJqKU',
    },
    {
        id: '3',
        name: 'Phân hữu cơ vi sinh',
        price: '50 ngàn/bao',
        seller: 'Anh Ba Ruộng',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuSGAF8XC5EFVKwEvFqzG9yQWxMAk5V1a4EWZBGsD8B6aCS-ZwfnRGcvs5Mw1lu7mjhEdu6L4WcoZha5CVK2B94321g2AecyJmWI-eGiIqeMb3HeD1GUiu3RLSgGHZ8YgYZukxAieBDM9OieAzxFiaj29AtkySjQTLBgRvehiIWfMvrQUHxzr3bQSidPE3qwDmSXIjxRi63zc2JEEeQfG07HwDJDpPD52yezYWZu91p-iQ_GgXSNE8h1pHNf_AmlFDoJ6S9nrmv28',
    },
    {
        id: '4',
        name: 'Thuốc trừ sâu sinh học',
        price: '80 ngàn/chai',
        seller: 'Cô Bảy Cà Mau',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAKzE6XusMeSNwdCnW6d69lQjnRa9bewIwslHFfmmNqtP_XMYqQGVnz4Evj4TC7aH7yiJtx48T9Pojn6cKmemsClvPwnjnEQrtXwyq1PJ6g3UF4zNmvaO-_xs9Mjprm2jsJ1P5-MlZIT30bkCh3rJH4ZOqe5POGTBb4zZEVfm-ITsIGpc_7DMY5DTuU2Wx-hG2dJ3Gen3qvRGsS7cQPYE2fRfOxWUQWPpT0RjswCrlYJ0Rd9cZm0ri5SuGb6HhRMCymgKWskyIMbk',
        badge: 'MỚI',
        badgeColor: '#1976D2',
    },
];

const FILTERS = ['Tất cả', 'Phân bón', 'Hạt giống', 'Thuốc sâu'];

export default function MarketScreen({ navigation }: MarketScreenProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Text style={{ fontSize: 24 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chợ Nhà Nông</Text>
                <TouchableOpacity
                    style={styles.cartBtnContainer}
                    accessibilityLabel="Giỏ hàng (sắp ra mắt)"
                >
                    <Text style={{ fontSize: 28 }}>🛒</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Text style={{ fontSize: 20, color: '#2E7D32', marginLeft: 12 }}>🔍</Text>
                    <TextInput
                        placeholder="Tìm phân bón, giống..."
                        style={styles.searchInput}
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.micBtn}>
                        <Text style={{ fontSize: 20 }}>🎤</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                {FILTERS.map(f => {
                    const isActive = activeFilter === f;
                    return (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, isActive ? styles.filterActive : styles.filterInactive]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[styles.filterText, { color: isActive ? '#162210' : '#444' }]}>{f}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerWrapper}>
            <View style={styles.banner}>
                <View style={styles.bannerIconBg}>
                    <Text style={{ fontSize: 32 }}>🏪</Text>
                </View>
                <View>
                    <Text style={styles.bannerGreeting}>Chào bác,</Text>
                    <Text style={styles.bannerMessage}>Hôm nay nhà mình cần mua gì?</Text>
                </View>
            </View>
        </View>
    );

    const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
        <View style={styles.productCard}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                {item.badge && (
                    <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                )}
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                <View style={styles.sellerRow}>
                    <Text style={{ fontSize: 14 }}>👤</Text>
                    <Text style={styles.sellerName} numberOfLines={1}>{item.seller}</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert("Gọi ngay", `Đang gọi cho ${item.seller}...`)}>
                        <Text style={{ fontSize: 18 }}>📞</Text>
                        <Text style={styles.callBtnText}>Gọi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f6f8f6" />
            {renderHeader()}

            <FlatList
                data={PRODUCTS.filter(p => {
                    // Search filter
                    const matchSearch = searchQuery === '' ||
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.seller.toLowerCase().includes(searchQuery.toLowerCase());
                    // Category filter
                    const matchCategory = activeFilter === 'Tất cả' ||
                        (activeFilter === 'Phân bón' && p.name.includes('Phân')) ||
                        (activeFilter === 'Hạt giống' && (p.name.includes('giống') || p.name.includes('Lúa'))) ||
                        (activeFilter === 'Thuốc sâu' && p.name.includes('Thuốc'));
                    return matchSearch && matchCategory;
                })}
                renderItem={renderProduct}
                keyExtractor={item => item.id}
                numColumns={2}
                ListHeaderComponent={renderBanner}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                ListEmptyComponent={
                    <View style={{ padding: 32, alignItems: 'center' }}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                        <Text style={{ fontSize: 18, color: '#666' }}>Không tìm thấy sản phẩm</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f6' },

    // Header
    headerContainer: {
        backgroundColor: 'rgba(246, 248, 246, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
        zIndex: 10,
    },
    topBar: {
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#121b0d',
    },
    iconBtn: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)'
    },
    cartBtnContainer: { position: 'relative', width: 40, alignItems: 'flex-end' },
    cartBadge: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#d32f2f', width: 20, height: 20, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff'
    },
    cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    // Search
    searchContainer: { paddingHorizontal: 16, marginTop: 8 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#ebf3e7', borderRadius: 12,
        height: 56, borderWidth: 1, borderColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1, height: '100%', fontSize: 18, color: '#162210', marginLeft: 8,
    },
    micBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: FarmerTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 8,
    },

    // Filters
    filterScroll: { marginTop: 12 },
    filterChip: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30,
        borderWidth: 1, borderColor: '#e0e0e0',
        height: 40, justifyContent: 'center', alignItems: 'center'
    },
    filterActive: {
        backgroundColor: FarmerTheme.colors.primary,
        borderColor: FarmerTheme.colors.primary,
        borderWidth: 2,
    },
    filterInactive: { backgroundColor: '#ebf3e7' },
    filterText: { fontWeight: '600', fontSize: 14 },

    // Banner
    bannerWrapper: { paddingHorizontal: 16, marginTop: 16, marginBottom: 16 },
    banner: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#ebf3e7', // Light green bg
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#c8e6c9', // Green 100
    },
    bannerIconBg: {
        backgroundColor: '#fff', padding: 8, borderRadius: 20, marginRight: 16, elevation: 2,
    },
    bannerGreeting: { fontSize: 14, color: '#666', fontWeight: '500' },
    bannerMessage: { fontSize: 18, fontWeight: 'bold', color: '#162210' },

    // Grid System
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    productCard: {
        width: '48%',
        backgroundColor: '#fff', borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
        borderWidth: 1, borderColor: '#eee'
    },
    imageWrapper: {
        width: '100%', aspectRatio: 4 / 3, backgroundColor: '#f5f5f5', position: 'relative',
    },
    productImage: { width: '100%', height: '100%' },
    badge: {
        position: 'absolute', top: 8, left: 8,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
        elevation: 2,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    productInfo: { padding: 12, flex: 1, justifyContent: 'space-between' },
    productName: { fontSize: 16, fontWeight: '800', color: '#162210', marginBottom: 4, lineHeight: 22 },
    sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    sellerName: { fontSize: 12, color: '#666', flex: 1 },

    priceRow: { marginTop: 'auto', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5', gap: 8 },
    price: { fontSize: 16, fontWeight: '900', color: '#d32f2f' },
    callBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: FarmerTheme.colors.primary, borderRadius: 20,
        paddingVertical: 8, gap: 4,
    },
    callBtnText: { fontWeight: 'bold', color: '#162210' },

});
