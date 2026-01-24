import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip } from 'react-native-paper';
import { MarketScreenProps } from '../types/navigation';

export default function MarketScreen({ navigation }: MarketScreenProps) {
    const products = [
        {
            id: 1,
            name: 'Phân hữu cơ Rơm Rạ',
            price: '35.000đ / bao',
            seller: 'Bác Ba Phi',
            location: 'Cần Thơ',
            image: 'https://example.com/phan-rom.jpg' // Placeholder
        },
        {
            id: 2,
            name: 'Nấm Rơm Sạch',
            price: '60.000đ / kg',
            seller: 'Cô Tư',
            location: 'An Giang',
            image: 'https://example.com/nam-rom.jpg'
        },
        {
            id: 3,
            name: 'Chitin Vỏ Tôm Thô',
            price: '15.000đ / kg',
            seller: 'Anh Sáu Tôm',
            location: 'Bạc Liêu',
            image: 'https://example.com/vo-tom.jpg'
        },
        {
            id: 4,
            name: 'Đan Lát Bèo Tây',
            price: '25.000đ / cái',
            seller: 'Chị Bảy',
            location: 'Đồng Tháp',
            image: 'https://example.com/beo-tay.jpg'
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.headerTitle}>Chợ Nông Sản Xanh</Title>
                <Paragraph>Sản phẩm tái chế từ phụ phẩm nông nghiệp</Paragraph>
            </View>

            <View style={styles.productList}>
                {products.map((product) => (
                    <Card key={product.id} style={styles.card}>
                        <Card.Cover source={{ uri: 'https://via.placeholder.com/150' }} style={styles.cardImage} />
                        <Card.Content>
                            <Title style={styles.productName}>{product.name}</Title>
                            <Text style={styles.price}>{product.price}</Text>
                            <View style={styles.infoRow}>
                                <Chip icon="account" style={styles.chip} textStyle={styles.chipText}>{product.seller}</Chip>
                                <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText}>{product.location}</Chip>
                            </View>
                        </Card.Content>
                        <Card.Actions>
                            <Button mode="contained" buttonColor="#2e7d32">Mua ngay</Button>
                        </Card.Actions>
                    </Card>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { padding: 20, backgroundColor: 'white', alignItems: 'center' },
    headerTitle: { color: '#2e7d32', fontWeight: 'bold' },
    productList: { padding: 10 },
    card: { marginBottom: 15, backgroundColor: 'white' },
    cardImage: { height: 150 },
    productName: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    price: { fontSize: 16, color: '#d32f2f', fontWeight: 'bold', marginVertical: 5 },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginVertical: 5 },
    chip: { backgroundColor: '#e8f5e9', height: 28 },
    chipText: { fontSize: 10, marginVertical: 0 }
});
