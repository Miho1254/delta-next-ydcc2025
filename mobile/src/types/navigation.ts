import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Create: undefined;
    Detail: { byproductId: string };
    Chat: { byproductId: string; name: string };
    Market: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type CreateScreenProps = NativeStackScreenProps<RootStackParamList, 'Create'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
export type MarketScreenProps = NativeStackScreenProps<RootStackParamList, 'Market'>;
