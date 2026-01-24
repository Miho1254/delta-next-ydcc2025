import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Card, Title, Text, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api, ByProduct } from '../services/api';

interface HomeScreenProps {
    navigation: {
        navigate: (screen: string, params?: object) => void;
    };
}

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
            onPress={() => navigation.navigate('Detail', { byproductId: item.id })}
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
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('Create')}
                color="white"
            />
        </View>
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
    loadingText: {
        marginTop: 16,
        color: '#666',
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        flex: 1,
    },
    cardType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 14,
        color: '#666',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    emptyHint: {
        fontSize: 14,
        color: '#999',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#2e7d32',
    },
});
