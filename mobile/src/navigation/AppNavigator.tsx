import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/app/HomeScreen';
import { CreateJobScreen } from '../screens/app/CreateJobScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { JobDetailsScreen } from '../screens/app/JobDetailsScreen';
import { colors } from '../theme/colors';
import { Home, PlusCircle, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="TabHome" 
        component={HomeScreen} 
        options={{ 
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="CreateJob" 
        component={CreateJobScreen} 
        options={{ 
          title: 'İlan Ver',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="JobDetails" 
        component={JobDetailsScreen} 
        options={{ 
          headerShown: true, 
          title: 'İlan Detayı',
          headerTintColor: colors.text,
        }} 
      />
    </Stack.Navigator>
  );
};
