import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import { MessageSquare, ChevronRight, User as UserIcon } from 'lucide-react-native';

const AVATAR_COLORS = [
  colors.brutalPink,
  '#86efac', // brutal green
  '#93c5fd', // brutal blue
  '#fdba74', // brutal orange
  '#c084fc', // brutal purple
  '#f87171', // brutal red
];

const getAvatarColor = (id: string) => {
  if (!id) return colors.primary;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

export const ConversationsScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchConversations();
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations().finally(() => {
        setIsLoading(false);
      });
    }, [])
  );

  const isFreelancer = user?.role === 'FREELANCER';

  const renderConversationItem = ({ item }: { item: any }) => {
    const otherUser = isFreelancer ? item.customer?.user : item.freelancer?.user;
    const lastMsg = item.messages?.[0];
    const isUnread = lastMsg && lastMsg.senderId !== user?.id && !lastMsg.isRead;

    // Formatted time
    let formattedTime = '';
    if (lastMsg?.createdAt) {
      const date = new Date(lastMsg.createdAt);
      formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isUnread && { backgroundColor: 'rgba(255, 201, 0, 0.08)' } // Subtle yellow tint for unread
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Chat', { conversation: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            {otherUser?.avatarUrl ? (
              <Image source={{ uri: otherUser.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(otherUser?.id || '') }]}>
                <Text style={styles.avatarInitials}>{getInitials(otherUser?.name || 'BK')}</Text>
              </View>
            )}
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <View style={styles.textContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.nameText} numberOfLines={1}>
                {otherUser?.name || 'Bilinmeyen Kullanıcı'}
              </Text>
              <Text style={styles.timeText}>{formattedTime}</Text>
            </View>
            <View style={styles.messageRow}>
              <Text 
                style={[
                  styles.messageText, 
                  isUnread && { fontWeight: '800', color: colors.text }
                ]} 
                numberOfLines={1}
              >
                {lastMsg ? lastMsg.content : 'Henüz mesaj yok...'}
              </Text>
              {item.isBlocked && (
                <View style={styles.blockedBadge}>
                  <Text style={styles.blockedBadgeText}>ENGELLEDİ</Text>
                </View>
              )}
            </View>
          </View>

          <ChevronRight size={20} color={colors.textSecondary} style={styles.chevron} />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquare size={48} color={colors.border} />
            <Text style={styles.emptyText}>Henüz hiçbir sohbetiniz bulunmuyor.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brutalPink,
    borderWidth: 2,
    borderColor: colors.border,
  },
  textContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  blockedBadge: {
    backgroundColor: colors.brutalRed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 6,
  },
  blockedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
