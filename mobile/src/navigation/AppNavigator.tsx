import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/app/HomeScreen';
import { FreelancersScreen } from '../screens/app/FreelancersScreen';
import { CreateJobScreen } from '../screens/app/CreateJobScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { JobDetailsScreen } from '../screens/app/JobDetailsScreen';
import { FreelancerDetailsScreen } from '../screens/app/FreelancerDetailsScreen';
import { NotificationsScreen } from '../screens/app/NotificationsScreen';
import { ConversationsScreen } from '../screens/app/ConversationsScreen';
import { ChatScreen } from '../screens/app/ChatScreen';
import { MatchmakingScreen } from '../screens/app/MatchmakingScreen';
import { HeaderNotificationButton } from '../components/HeaderNotificationButton';
import { HeaderMatchmakingButton } from '../components/HeaderMatchmakingButton';
import { colors } from '../theme/colors';
import { Home, PlusCircle, User, Users, MessageSquare } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HeaderMatchmakingButton />
            <HeaderNotificationButton />
          </View>
        ),
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
        name="Freelancers" 
        component={FreelancersScreen} 
        options={{ 
          title: 'Yetenekler',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
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
        name="Conversations" 
        component={ConversationsScreen} 
        options={{ 
          title: 'Mesajlar',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />
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
        name="Matchmaking" 
        component={MatchmakingScreen} 
        options={{ 
          headerShown: true, 
          title: 'Sihirli Eşleşme',
          headerTintColor: colors.text,
        }} 
      />
      <Stack.Screen 
        name="JobDetails" 
        component={JobDetailsScreen} 
        options={{ 
          headerShown: true, 
          title: 'İlan Detayı',
          headerTintColor: colors.text,
        }} 
      />
      <Stack.Screen 
        name="FreelancerDetails" 
        component={FreelancerDetailsScreen} 
        options={{ 
          headerShown: true, 
          title: 'Freelancer Profili',
          headerTintColor: colors.text,
        }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          headerShown: true, 
          title: 'Bildirimler',
          headerTintColor: colors.text,
        }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          headerShown: true, 
          title: 'Sohbet',
          headerTintColor: colors.text,
        }} 
      />
    </Stack.Navigator>
  );
};
