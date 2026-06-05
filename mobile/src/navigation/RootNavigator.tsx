import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { colors } from '../theme/colors';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchNotifications();

      // Poll every 30 seconds (matches the web app behavior)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    } else {
      clearNotifications();
    }
  }, [isAuthenticated, fetchNotifications, clearNotifications]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
