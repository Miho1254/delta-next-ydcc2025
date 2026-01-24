import { DefaultTheme } from 'react-native-paper';

export const FarmerTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#2E7D32', // Deep Green
        accent: '#F9A825', // Golden Yellow
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#1B5E20',
        placeholder: '#666666',
        error: '#D32F2F',
    },
    roundness: 16,
    fonts: {
        ...DefaultTheme.fonts,
        medium: {
            fontFamily: 'System',
            fontWeight: '600',
        },
        bold: {
            fontFamily: 'System',
            fontWeight: 'bold',
        },
    },
    spacing: {
        small: 8,
        medium: 16,
        large: 24,
        extraLarge: 32,
    },
    typography: {
        header: {
            fontSize: 28,
            fontWeight: 'bold',
            lineHeight: 34,
            color: '#1B5E20',
        },
        subHeader: {
            fontSize: 22,
            fontWeight: '600',
            lineHeight: 28,
            color: '#2E7D32',
        },
        body: {
            fontSize: 18, // Minimum 18px for readability
            lineHeight: 26,
            color: '#333333',
        },
        button: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
    },
} as const;
