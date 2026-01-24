import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateScreen from './src/screens/CreateScreen';
import ChatScreen from './src/screens/ChatScreen';
import MarketScreen from './src/screens/MarketScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2e7d32',
    secondary: '#81c784',
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  };

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          {!isLoggedIn ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login">
                {() => (
                  <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          ) : (
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: '#2e7d32' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: '🌱 Agri-Loop' }}
              />
              <Stack.Screen
                name="Create"
                component={CreateScreen}
                options={{ title: 'Tạo đống ủ mới' }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                  title: route.params?.name || 'Chat với AI',
                })}
              />
              <Stack.Screen
                name="Market"
                component={MarketScreen}
                options={{ title: 'Chợ Nông Sản' }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
