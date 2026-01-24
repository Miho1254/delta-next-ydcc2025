import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, NativeModules } from 'react-native';
import { FAB, Card, Title, Text, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api, ByProduct } from '../services/api';
import { HomeScreenProps } from '../types/navigation';

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const [byproducts, setByproducts] = useState<ByProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);

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

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <IconButton
                    icon="logout"
                    iconColor="white"
                    onPress={() => {
                        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
                            { text: 'Huỷ', style: 'cancel' },
                            {
                                text: 'Đồng ý',
                                onPress: async () => {
                                    await api.clearToken();
                                    // Hack to reload app since we don't expose auth state setter yet
                                    if (NativeModules.DevSettings) {
                                        NativeModules.DevSettings.reload();
                                    } else {
                                        Alert.alert('Đã đăng xuất', 'Vui lòng khởi động lại ứng dụng.');
                                    }
                                }
                            }
                        ]);
                    }}
                />
            ),
        });
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchByProducts();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new_product': return '#2196F3';
            case 'processing': return '#FF9800';
            case 'ready_to_harvest': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'new_product': return 'Mới';
            case 'processing': return 'Đang ủ';
            case 'ready_to_harvest': return 'Sẵn sàng';
            default: return 'Không rõ';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'straw': return '🌾 Rơm rạ';
            case 'shrimp_shell': return '🦐 Vỏ tôm';
            case 'hyacinth': return '🌿 Bèo tây';
            default: return '❓ Khác';
        }
    };

    const renderItem = ({ item }: { item: ByProduct }) => (
        <Card
            style={styles.card}
            onPress={() => navigation.navigate('Chat', { byproductId: item.id, name: item.name })}
        >
            <Card.Content>
                <View style={styles.cardHeader}>
                    <Title style={styles.cardTitle}>{item.name}</Title>
                    <Chip
                        style={{ backgroundColor: getStatusColor(item.status) }}
                        textStyle={{ color: 'white', fontSize: 12 }}
                    >
                        {getStatusText(item.status)}
                    </Chip>
                </View>
                <Text style={styles.cardType}>{getTypeText(item.type)}</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Độ phân hủy:</Text>
                    <Text style={styles.progressValue}>
                        {item.contextData?.decompositionLevel || 0}%
                    </Text>
                </View>
            </Card.Content>
            <Card.Actions>
                <IconButton
                    icon="chat"
                    onPress={() => navigation.navigate('Chat', { byproductId: item.id, name: item.name })}
                />
            </Card.Actions>
        </Card>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={byproducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có đống ủ nào</Text>
                        <Text style={styles.emptyHint}>Bấm nút + để tạo đống ủ mới</Text>
                    </View>
                }
            />
            <FAB.Group
                open={fabOpen}
                icon={fabOpen ? 'close' : 'menu'}
                actions={[
                    {
                        icon: 'cart',
                        label: 'Chợ nông sản',
                        onPress: () => navigation.navigate('Market'),
                        style: { backgroundColor: '#fff' },
                        color: '#2e7d32',
                    },
                    {
                        icon: 'plus',
                        label: 'Tạo đống ủ',
                        onPress: () => navigation.navigate('Create'),
                        style: { backgroundColor: '#fff' },
                        color: '#2e7d32',
                    },
                ]}
                onStateChange={({ open }) => setFabOpen(open)}
                fabStyle={styles.fab}
                color="white"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, color: '#666' },
    list: { padding: 16, paddingBottom: 80 },
    card: { marginBottom: 16, elevation: 2, backgroundColor: 'white' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 18, flex: 1, fontWeight: 'bold' },
    cardType: { fontSize: 14, color: '#666', marginBottom: 8 },
    progressContainer: { flexDirection: 'row', alignItems: 'center' },
    progressLabel: { fontSize: 14, color: '#666' },
    progressValue: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32', marginLeft: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { fontSize: 18, color: '#666', marginBottom: 8 },
    emptyHint: { fontSize: 14, color: '#999' },
    fab: { backgroundColor: '#2e7d32', paddingBottom: 0 },
});
