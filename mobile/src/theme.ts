import { DefaultTheme } from 'react-native-paper';

export const FarmerTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#5bec13', // Rice-leaf green (Vibrant)
        primaryDark: '#4cd10f',
        accent: '#F9A825', // Keep for secondary highlights if needed
        background: '#fcfdfa', // Warm off-white
        surface: '#FFFFFF',
        text: '#162210', // Dark earth/green
        placeholder: '#8da38a',
        error: '#ff5252',

        // Custom semantic colors
        earthBrown: '#2b1d0e',
        earthLight: '#efebe9',
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
