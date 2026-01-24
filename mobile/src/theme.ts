import { DefaultTheme } from 'react-native-paper';

export const FarmerTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        // "Golden Harvest" Palette - Pro Max Agriculture
        // Concept: Deep Trust (Emerald) + Victory (Gold)

        // Primary: Deep Emerald - Authoritative, Trustworthy, Premium
        primary: '#004733',       // Was '#006d4e' -> Now Darker/Richer
        primaryDark: '#002c1f',   // For active states/shadows
        primaryLight: '#d9f7be',  // Fresh young leaves (lighter greens)

        // Accent: Vivid Gold - The "Harvest", Awards, Call-to-Action
        accent: '#faad14',        // Ant Design Gold 6
        accentLight: '#fffbe6',   // Gold 1 (Backgrounds)
        accentDark: '#d48806',    // Gold 7 (Borders/Text)

        // Backgrounds - High Contrast but Warm
        background: '#f5f5f5',    // Warm Grey - Standard Ant Pro bg
        surface: '#ffffff',       // Pure White Cards

        // Text - U50 Accessible (High Scale)
        text: '#1f1f1f',          // Ink Black (Ant Design Title)
        textSecondary: '#595959', // Neutral 8 (Ant Design Secondary)
        textLight: '#8c8c8c',     // Neutral 6

        // Functional
        placeholder: '#bfbfbf',
        border: '#d9d9d9',        // Ant Neutral 5

        error: '#ff4d4f',         // Ant Red 5 (Brighter than Dust Red)
        success: '#52c41a',       // Ant Green 6 (Vibrant)
        warning: '#faad14',       // Gold 6
        info: '#1890ff',          // Ant Blue 6 (Rarely used, maybe for links)
    },
    roundness: 16, // Pro Max standard
    spacing: {
        xs: 4,
        small: 8,
        medium: 16, // Increased from 12 for "Airy" feel
        large: 24,
        xl: 32,
    },
    typography: {
        // "Big Bold" System for U50
        header: {
            fontSize: 32,
            fontWeight: '800', // Extra Bold
            lineHeight: 40,
            color: '#1f1f1f',
            letterSpacing: -0.8,
        },
        subHeader: {
            fontSize: 22, // Up from 20
            fontWeight: '700',
            lineHeight: 30,
            color: '#1f1f1f',
        },
        body: {
            fontSize: 18, // Up from 17
            lineHeight: 28,
            color: '#262626',
            fontWeight: '400',
        },
        button: {
            fontSize: 18,
            fontWeight: '700',
            color: '#FFFFFF',
            textTransform: 'uppercase', // Strong CTAs
        },
        caption: {
            fontSize: 14, // Up from 12/10
            fontWeight: '600',
            color: '#595959',
            lineHeight: 20,
        }
    },
    shadows: {
        // "Pro Max" Elevation - Deep and Soft
        card: {
            elevation: 4,
            shadowColor: '#002c1f', // Primary Dark shadow
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
        },
        // Floating Elements
        float: {
            elevation: 8,
            shadowColor: '#faad14', // Gold Glow for actions
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
        },
        // Subtle Border
        border: {
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
        }
    }
} as const;
