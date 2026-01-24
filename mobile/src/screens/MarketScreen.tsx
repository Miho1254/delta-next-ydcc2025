import React from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, Badge } from 'react-native-paper';
import { MarketScreenProps } from '../types/navigation';

// Mock product data with farmer-first naming and sponsored flags
const products = [
    {
        id: 1,
        name: 'Phân hữu cơ Rơm Rạ (50kg)',
        price: '35.000đ',
        seller: 'Chú Tư Cờ Đỏ',
        location: 'Ô Môn, Cần Thơ',
        isSponsored: true,
        rating: 4.8,
    },
    {
        id: 2,
        name: 'Nấm Rơm Tươi Organic',
        price: '65.000đ/kg',
        seller: 'Bác Bảy Thốt Nốt',
        location: 'An Phú, An Giang',
        isSponsored: true,
        rating: 4.9,
    },
    {
        id: 3,
        name: 'Chitin Vỏ Tôm Thô',
        price: '18.000đ/kg',
        seller: 'Anh Sáu Tôm',
        location: 'Giá Rai, Bạc Liêu',
        isSponsored: false,
        rating: 4.5,
    },
    {
        id: 4,
        name: 'Đan Lát Bèo Tây Thủ Công',
        price: '28.000đ/cái',
        seller: 'Chị Hai Bèo',
        location: 'Cao Lãnh, Đồng Tháp',
        isSponsored: false,
        rating: 4.7,
    },
    {
        id: 5,
        name: 'Than Trấu Cao Cấp',
        price: '12.000đ/kg',
        seller: 'Ông Năm Gạo',
        location: 'Long An',
        isSponsored: false,
        rating: 4.6,
    }
];

export default function MarketScreen({ navigation }: MarketScreenProps) {
    const handleBuy = (productName: string, sellerName: string) => {
        Alert.alert(
            '🛒 Đặt hàng',
            `Bạn muốn mua "${productName}" từ ${sellerName}?\n\n📞 Liên hệ: 0901 234 567`,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Gọi ngay', onPress: () => Alert.alert('Đã gọi!', 'Tính năng đang phát triển.') }
            ]
        );
    };

    const handleBannerPress = () => {
        Alert.alert(
            '⚡ Kubota Việt Nam',
            'Máy gặt đập liên hợp Kubota DC-70\n\nLiên hệ đại lý gần nhất:\n📞 1800 1500',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Title style={styles.headerTitle}>🌾 Chợ Nông Sản Xanh</Title>
                <Paragraph style={styles.headerSub}>Kết nối trực tiếp Nông dân - Người tiêu dùng</Paragraph>
            </View>

            {/* B2B Banner */}
            <View style={styles.bannerContainer}>
                <Card style={styles.bannerCard} onPress={handleBannerPress}>
                    <View style={styles.bannerContent}>
                        <View style={styles.bannerTextArea}>
                            <Text style={styles.bannerTitle}>KUBOTA</Text>
                            <Text style={styles.bannerSubtitle}>Đồng hành cùng nhà nông Việt</Text>
                            <Text style={styles.bannerCTA}>Máy gặt đập liên hợp DC-70</Text>
                        </View>
                        <View style={styles.bannerBadge}>
                            <Text style={styles.bannerBadgeText}>Quảng cáo</Text>
                        </View>
                    </View>
                </Card>
            </View>

            {/* Product List */}
            <View style={styles.productList}>
                {products.map((product) => (
                    <Card key={product.id} style={styles.card}>
                        {/* Sponsored Badge */}
                        {product.isSponsored && (
                            <View style={styles.sponsoredBadge}>
                                <Text style={styles.sponsoredText}>⚡ TIN TÀI TRỢ</Text>
                            </View>
                        )}

                        <Card.Cover
                            source={{ uri: `https://via.placeholder.com/300x150/e8f5e9/2e7d32?text=${encodeURIComponent(product.name.substring(0, 10))}` }}
                            style={styles.cardImage}
                        />
                        <Card.Content>
                            <Title style={styles.productName}>{product.name}</Title>
                            <Text style={styles.price}>{product.price}</Text>
                            <View style={styles.infoRow}>
                                <Chip icon="account" style={styles.chip} textStyle={styles.chipText}>
                                    {product.seller}
                                </Chip>
                                <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText}>
                                    {product.location}
                                </Chip>
                            </View>
                            <View style={styles.ratingRow}>
                                <Text style={styles.ratingText}>⭐ {product.rating}</Text>
                                <Text style={styles.soldText}>Đã bán 50+</Text>
                            </View>
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                mode="outlined"
                                textColor="#2e7d32"
                                onPress={() => Alert.alert('Chat', 'Tính năng chat với người bán đang phát triển.')}
                            >
                                Chat
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor="#2e7d32"
                                onPress={() => handleBuy(product.name, product.seller)}
                            >
                                Mua ngay
                            </Button>
                        </Card.Actions>
                    </Card>
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>🌱 Agri-Loop - Kinh tế tuần hoàn cho nông nghiệp</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },

    // Header
    header: {
        padding: 20,
        backgroundColor: '#2e7d32',
        alignItems: 'center'
    },
    headerTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    headerSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
    },

    // B2B Banner
    bannerContainer: {
        padding: 10,
        paddingBottom: 0,
    },
    bannerCard: {
        backgroundColor: '#1565c0',
        borderRadius: 12,
    },
    bannerContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerTextArea: {
        flex: 1,
    },
    bannerTitle: {
        color: '#ffeb3b',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    bannerSubtitle: {
        color: 'white',
        fontSize: 13,
        marginTop: 2,
    },
    bannerCTA: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        marginTop: 4,
    },
    bannerBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    bannerBadgeText: {
        color: 'white',
        fontSize: 10,
    },

    // Products
    productList: { padding: 10 },
    card: {
        marginBottom: 15,
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden',
    },
    cardImage: { height: 150 },
    productName: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    price: { fontSize: 18, color: '#d32f2f', fontWeight: 'bold', marginVertical: 5 },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginVertical: 5 },
    chip: { backgroundColor: '#e8f5e9', height: 28 },
    chipText: { fontSize: 10, marginVertical: 0 },

    // Sponsored Badge
    sponsoredBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#ff6f00',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 10,
    },
    sponsoredText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Rating
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 10,
    },
    ratingText: {
        fontSize: 13,
        color: '#ff9800',
        fontWeight: '600',
    },
    soldText: {
        fontSize: 12,
        color: '#9e9e9e',
    },

    // Footer
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9e9e9e',
    },
});
