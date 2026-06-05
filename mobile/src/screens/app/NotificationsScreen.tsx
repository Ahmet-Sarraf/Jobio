import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Bell, CheckCheck, Clock, MailOpen, AlertCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { useNotificationStore, Notification } from '../../store/useNotificationStore';

const CARD_COLORS = [
  colors.brutalYellow,
  colors.brutalPink,
  '#86efac', // brutal green
  colors.brutalBlue,
  '#fdba74', // brutal orange
];

export const NotificationsScreen = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkOneRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  const renderNotificationItem = ({ item, index }: { item: Notification; index: number }) => {
    const cardColor = CARD_COLORS[index % CARD_COLORS.length];
    const isBlue = cardColor === colors.brutalBlue;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: cardColor },
          item.isRead && styles.cardRead,
        ]}
        onPress={() => handleMarkOneRead(item.id, item.isRead)}
        activeOpacity={item.isRead ? 1 : 0.7}
      >
        <View style={styles.cardHeader}>
          {!item.isRead && <View style={styles.unreadDot} />}
          <Text
            style={[
              styles.cardText,
              { color: isBlue ? '#fff' : '#000' },
              item.isRead && styles.cardTextRead,
            ]}
          >
            {item.message}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <Clock size={12} color={isBlue ? '#f3f4f6' : '#4b5563'} />
          <Text style={[styles.dateText, { color: isBlue ? '#f3f4f6' : '#4b5563' }]}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllAsRead}
            activeOpacity={0.8}
          >
            <CheckCheck size={16} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.markAllBtnText}>HEPSİNİ OKUNDU İŞARETLE</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brutalBlue} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.brutalBlue]}
              tintColor={colors.brutalBlue}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Bell size={48} color={colors.text} />
              </View>
              <Text style={styles.emptyTitle}>BİLDİRİMİNİZ YOK</Text>
              <Text style={styles.emptySub}>
                Yeni bir güncelleme veya hareketlilik olduğunda burada görünecektir.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    // Neo-Brutalist shadow
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  markAllBtnText: {
    fontWeight: '900',
    fontSize: 12,
    color: '#000',
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#000',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    // Neo-Brutalist shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardRead: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    shadowColor: 'transparent',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brutalRed,
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 6,
    marginRight: 8,
  },
  cardText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '800',
    lineHeight: 20,
  },
  cardTextRead: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brutalYellow,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '900',
    color: '#000',
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 20,
    fontWeight: '700',
  },
});
