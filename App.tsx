import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '@/context/UserContext';
import { LogProvider } from '@/context/LogContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <LogProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </LogProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
