import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useNotificationStore } from '../store/useNotificationStore';

export const HeaderNotificationButton = () => {
  const navigation = useNavigation<any>();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <Bell size={24} color={colors.text} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Neo-Brutalist flat shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
});
