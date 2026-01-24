import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, FlatList, TextInput, StatusBar, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MarketScreenProps } from '../types/navigation';
import { FarmerTheme } from '../theme';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Data (Keep as is)
const PRODUCTS = [
    {
        id: '1',
        name: 'Phân bón NPK 20-20-15',
        price: '15 ngàn/kg',
        seller: 'Chú Tư',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjSOR8jE_C1lZzTCWAxOry5i7f8TFjAukabnJsX7Tc_MbqVyaw4xTgaBsTonWxjbfkwsiizDTST96iHbKKkWFqHAjLCChVaIm0OmLbHz1Y6QNASqN7bA3a0tCYfo_WzDi_UtGJHm-RHsJg9ACdKiHoN6MF8tCUw-Gqqcmm8lcrUDelWb3lKZCINkeifW1_B8VBxKdHSYrsQc5tdbFxct-IFdk1hzzZvxDQzT4C1Hh6U-fPD-a4bwlUuzqJOFSLgW2moA7mnpE-FlA',
        badge: 'HOT',
        badgeColor: FarmerTheme.colors.error,
    },
    {
        id: '2',
        name: 'Lúa giống ST25 (10kg)',
        price: '200 ngàn',
        seller: 'Dì Năm',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHazqnNCxTai1UiVlWujIgBWrIq9bAYC3VlexQ-y18ORwMGDS3MlDsl2zU8DrqPhWl268H938M48KAxyVQgDnO6dS8P46_C4l--mKSYj-27rU6GGsogxdpoyjL59QobZzRSMj5FS1OQOhEcsh71ueOdIE_TuRHvrfX6tLlokxswckcb6vrXDr4dNYZZL_E5JbH_SRAZqSh8rcSLp6CxYwDca3Q0hjawizrT3QM4iVtJVSRrnSEqQkjEl-cFlHbxOkK6z7Yt7oJqKU',
    },
    {
        id: '3',
        name: 'Phân hữu cơ vi sinh',
        price: '50 ngàn',
        seller: 'Anh Ba',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuSGAF8XC5EFVKwEvFqzG9yQWxMAk5V1a4EWZBGsD8B6aCS-ZwfnRGcvs5Mw1lu7mjhEdu6L4WcoZha5CVK2B94321g2AecyJmWI-eGiIqeMb3HeD1GUiu3RLSgGHZ8YgYZukxAieBDM9OieAzxFiaj29AtkySjQTLBgRvehiIWfMvrQUHxzr3bQSidPE3qwDmSXIjxRi63zc2JEEeQfG07HwDJDpPD52yezYWZu91p-iQ_GgXSNE8h1pHNf_AmlFDoJ6S9nrmv28',
    },
    {
        id: '4',
        name: 'Thuốc trừ sâu sinh học',
        price: '80 ngàn/chai',
        seller: 'Cô Bảy',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAKzE6XusMeSNwdCnW6d69lQjnRa9bewIwslHFfmmNqtP_XMYqQGVnz4Evj4TC7aH7yiJtx48T9Pojn6cKmemsClvPwnjnEQrtXwyq1PJ6g3UF4zNmvaO-_xs9Mjprm2jsJ1P5-MlZIT30bkCh3rJH4ZOqe5POGTBb4zZEVfm-ITsIGpc_7DMY5DTuU2Wx-hG2dJ3Gen3qvRGsS7cQPYE2fRfOxWUQWPpT0RjswCrlYJ0Rd9cZm0ri5SuGb6HhRMCymgKWskyIMbk',
        badge: 'MỚI',
        badgeColor: FarmerTheme.colors.accent,
    },
];

const FILTERS = ['Tất cả', 'Phân bón', 'Hạt giống', 'Thuốc sâu'];

export default function MarketScreen({ navigation }: MarketScreenProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Top Bar - Deep Emerald */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <AntDesign name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CHỢ NHÀ NÔNG</Text>
                <TouchableOpacity style={styles.cartBtnContainer}>
                    <AntDesign name="shopping-cart" size={24} color="#fff" />
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Search Bar - Floating */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchBox}>
                    <Feather name="search" size={20} color={FarmerTheme.colors.textSecondary} style={{ marginLeft: 16 }} />
                    <TextInput
                        placeholder="Tìm sản phẩm..."
                        style={styles.searchInput}
                        placeholderTextColor={FarmerTheme.colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.micBtn}>
                        <Feather name="mic" size={20} color={FarmerTheme.colors.primary} />
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
                            <Text style={[styles.filterText, { color: isActive ? FarmerTheme.colors.primary : '#fff' }]}>{f}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerWrapper}>
            <View style={styles.banner}>
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerGreeting}>MÙA VÀNG BỘI THU</Text>
                    <Text style={styles.bannerMessage}>Ưu đãi phân bón hữu cơ giảm 20%</Text>
                </View>
                <View style={styles.bannerIconBg}>
                    <MaterialCommunityIcons name="corn" size={40} color={FarmerTheme.colors.accent} />
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
                    <Feather name="user" size={14} color={FarmerTheme.colors.textSecondary} />
                    <Text style={styles.sellerName} numberOfLines={1}>{item.seller}</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => Alert.alert("Gọi ngay", `Đang gọi cho ${item.seller}...`)}
                        activeOpacity={0.7}
                    >
                        <Feather name="phone-call" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={FarmerTheme.colors.primary} />
            {renderHeader()}

            <FlatList
                data={PRODUCTS}
                renderItem={renderProduct}
                keyExtractor={item => item.id}
                numColumns={2}
                ListHeaderComponent={renderBanner}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: FarmerTheme.colors.background },

    // Header - Pro Max
    headerContainer: {
        backgroundColor: FarmerTheme.colors.primary,
        borderBottomRightRadius: 24,
        paddingBottom: 24,
        zIndex: 10,
        ...FarmerTheme.shadows.card,
    },
    topBar: {
        paddingTop: Platform.OS === 'android' ? 44 : 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20, fontWeight: '800', letterSpacing: 1,
        color: '#fff',
    },
    iconBtn: { padding: 8 },
    cartBtnContainer: { position: 'relative', padding: 8 },
    cartBadge: {
        position: 'absolute', top: 4, right: 4,
        backgroundColor: FarmerTheme.colors.accent, width: 18, height: 18, borderRadius: 9,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#fff'
    },
    cartBadgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

    // Search - Floating
    searchWrapper: { paddingHorizontal: 16 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 25,
        height: 50,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
    },
    searchInput: {
        flex: 1, height: '100%', fontSize: 16, color: FarmerTheme.colors.text, marginLeft: 12,
    },
    micBtn: {
        padding: 12,
    },

    // Filters
    filterScroll: { marginTop: 16 },
    filterChip: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 0,
    },
    filterActive: {
        backgroundColor: FarmerTheme.colors.accent,
        borderColor: FarmerTheme.colors.accent,
    },
    filterInactive: { backgroundColor: 'transparent' },
    filterText: { fontWeight: '700', fontSize: 14 },

    // Banner
    bannerWrapper: { marginTop: 24, marginBottom: 16 },
    banner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#002c1f', // Deepest Green
        borderRadius: 16, padding: 20,
        ...FarmerTheme.shadows.card,
    },
    bannerContent: { flex: 1 },
    bannerGreeting: { fontSize: 12, color: FarmerTheme.colors.accent, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    bannerMessage: { fontSize: 18, fontWeight: '700', color: '#fff' },
    bannerIconBg: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', marginLeft: 16
    },

    // Grid System
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    productCard: {
        width: '48%',
        backgroundColor: '#fff', borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
        ...FarmerTheme.shadows.card,
    },
    imageWrapper: {
        width: '100%', aspectRatio: 1, backgroundColor: '#f5f5f5', position: 'relative',
    },
    productImage: { width: '100%', height: '100%' },
    badge: {
        position: 'absolute', top: 8, left: 8,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
        elevation: 2,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    productInfo: { padding: 12, flex: 1, justifyContent: 'space-between' },
    productName: { fontSize: 16, fontWeight: '700', color: FarmerTheme.colors.text, marginBottom: 6, lineHeight: 22 },
    sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    sellerName: { fontSize: 12, color: FarmerTheme.colors.textSecondary, flex: 1 },

    priceRow: { marginTop: 'auto', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5', gap: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { fontSize: 16, fontWeight: '800', color: FarmerTheme.colors.error }, // Red for price is standard
    callBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: FarmerTheme.colors.success,
        justifyContent: 'center', alignItems: 'center',
        elevation: 2,
    },
});
