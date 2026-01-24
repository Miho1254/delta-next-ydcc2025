import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ydcc.worldsimp.com/api';

class ApiClient {
    private token: string | null = null;

    async setToken(token: string) {
        this.token = token;
        await AsyncStorage.setItem('accessToken', token);
    }

    async getToken(): Promise<string | null> {
        if (!this.token) {
            this.token = await AsyncStorage.getItem('accessToken');
        }
        return this.token;
    }

    async clearToken() {
        this.token = null;
        await AsyncStorage.removeItem('accessToken');
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = await this.getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.userMessage || 'Lỗi hệ thống');
        }

        return data;
    }

    // Auth
    async login(phone: string, name?: string) {
        const data = await this.request<{ accessToken: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, name }),
        });
        await this.setToken(data.accessToken);
        return data;
    }

    // ByProducts
    async getByProducts() {
        return this.request<{ data: ByProduct[] }>('/byproducts');
    }

    async getByProduct(id: string) {
        return this.request<{ byproduct: ByProduct; timeline: TimelineEntry[] }>(`/byproducts/${id}`);
    }

    // Create ByProduct
    async createByProduct(data: { name: string; type: string; location: string; imageBase64?: string }) {
        return this.request<{ byproduct: ByProduct }>('/byproducts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Identify ByProduct
    async identifyByProduct(imageBase64: string): Promise<string> {
        const response = await this.request<{ identifiedName: string }>('/byproducts/identify', {
            method: 'POST',
            body: JSON.stringify({ imageBase64 }),
        });
        return response.identifiedName;
    }

    async chat(byproductId: string, data: {
        text?: string;
        imageBase64?: string;
        contextString?: string;
        richContext?: {
            location: string;
            weather: string;
            regionName?: string;
            climateZone?: string;
            soilType?: string;
            regionTips?: string[];
            rainAlert?: string | null;
            tempAdvice?: string;
            warnings?: string[];
        };
    }) {
        return this.request<{ analysis: AIAnalysis; timeline: TimelineEntry[] }>(`/byproducts/${byproductId}/chat`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteByProduct(id: string) {
        return this.request<{ message: string }>(`/byproducts/${id}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();

// Types
export interface User {
    id: string;
    phone: string;
    name: string;
    region: string;
}

export interface ByProduct {
    id: string;
    name: string;
    type: string;
    status: string;
    location: string;
    startImageUrl: string;
    contextData: {
        decompositionLevel?: number;
        currentCondition?: string;
    };
    createdAt: string;
}

export interface TimelineEntry {
    id: string;
    byproductId: string;
    timestamp: number;
    role: 'user' | 'model';
    content: string;
    metadata?: {
        hasImage?: boolean;
        imageUrl?: string;
        decompositionLevel?: number;
        suggestedQuestions?: string[];
    };
}

export interface AIAnalysis {
    decompositionLevel: number;
    recommendation: {
        action: string;
        reason: string;
        estimatedDays: number | null;
    };
    chatResponse: string;
    suggestedQuestions?: string[];
}
