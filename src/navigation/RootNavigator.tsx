import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '@/theme/theme';
import { useUser } from '@/context/UserContext';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { FoodSearchScreen } from '@/screens/FoodSearchScreen';
import { ExerciseScreen } from '@/screens/ExerciseScreen';
import { WaterScreen } from '@/screens/WaterScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '◐',
  Search: '⟡',
  Exercise: '✺',
  Water: '◆',
  Profile: '❁',
};

export function RootNavigator() {
  const { profile, isLoading, setProfile } = useUser();

  if (isLoading) return null;

  if (!profile) {
    return <OnboardingScreen onComplete={() => {}} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.terracottaDark,
          tabBarInactiveTintColor: colors.inkSoft,
          tabBarStyle: { backgroundColor: colors.cream, borderTopColor: colors.border },
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={FoodSearchScreen} />
        <Tab.Screen name="Exercise" component={ExerciseScreen} />
        <Tab.Screen name="Water" component={WaterScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
