import { DefaultTheme } from 'react-native-paper';

export const FarmerTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        // Premium Nature Palette (60-30-10 Rule)
        primary: '#2E7D32',       // Forest Green (Trust, Nature)
        primaryDark: '#1B5E20',   // Deep Forest
        primaryLight: '#E8F5E9',  // Pale Sage (Surface)

        accent: '#FF6F00',        // Amber (Action/Warmth)
        accentLight: '#FFF8E1',   // Pale Amber

        background: '#FAFAFA',    // Clean Neutral (60%)
        surface: '#FFFFFF',       // Card Surface

        text: '#1B5E20',          // Deep Green Text (High Contrast)
        textSecondary: '#558B2F', // Muted Green
        textLight: '#757575',     // Grey text

        placeholder: '#BDBDBD',
        error: '#D32F2F',

        // Semantic
        success: '#43A047',
        warning: '#FFA000',
        info: '#1976D2',
    },
    roundness: 24, // Rounded-2xl ~ 24px
    spacing: {
        small: 8,
        medium: 16,
        large: 24,
        extraLarge: 32,
    },
    typography: {
        header: {
            fontSize: 34, // Giant
            fontWeight: '800',
            lineHeight: 40,
            color: '#162210',
            letterSpacing: -0.5,
        },
        subHeader: {
            fontSize: 26, // Super
            fontWeight: '700',
            lineHeight: 32,
            color: '#162210',
        },
        body: {
            fontSize: 18,
            lineHeight: 28,
            color: '#2b1d0e',
        },
        button: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#162210',
        },
    },
} as const;
