import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import { getSocketAsync } from '../../services/socket';
import { Send, Ban, Trash2, Check, CheckCheck } from 'lucide-react-native';

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

export const ChatScreen = ({ route, navigation }: any) => {
  const { conversation } = route.params;
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(conversation.isBlocked);

  const flatListRef = useRef<FlatList>(null);
  const isFreelancer = user?.role === 'FREELANCER';
  const otherUser = isFreelancer ? conversation.customer?.user : conversation.freelancer?.user;

  // Header options configuration
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          {otherUser?.avatarUrl ? (
            <Image source={{ uri: otherUser.avatarUrl }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatarFallback, { backgroundColor: getAvatarColor(otherUser?.id || '') }]}>
              <Text style={styles.headerAvatarInitials}>{getInitials(otherUser?.name || 'BK')}</Text>
            </View>
          )}
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {otherUser?.name || 'Sohbet'}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          {!isBlocked && (
            <TouchableOpacity 
              onPress={handleBlockConversation} 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ban size={20} color={colors.brutalRed} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={handleDeleteConversation} 
            style={[styles.headerButton, { marginLeft: spacing.md }]}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, otherUser, isBlocked]);

  // 1. Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/conversations/${conversation.id}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        Alert.alert('Hata', 'Mesaj geçmişi yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation.id]);

  // 2. Setup socket room and events
  useEffect(() => {
    if (!token) return;

    let socket: any = null;

    const setupSocketConnection = async () => {
      socket = getSocketAsync(token);
      if (!socket) return;

      // Ensure connected
      if (!socket.connected) {
        socket.connect();
      }

      // Join room and mark as read
      socket.emit('join_conversation', conversation.id);
      socket.emit('read_messages', conversation.id);

      // Handle receiving new message
      socket.on('receive_message', (message: any) => {
        if (message.conversationId === conversation.id) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });

          // Mark message as read immediately
          socket.emit('read_messages', conversation.id);
        }
      });

      // Handle message read status updates
      socket.on('messages_read', ({ conversationId, readBy }: any) => {
        if (conversationId === conversation.id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.conversationId === conversationId && msg.senderId !== readBy
                ? { ...msg, isRead: true }
                : msg
            )
          );
        }
      });
    };

    setupSocketConnection();

    // Clean up socket listeners on unmount
    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversation.id);
        socket.off('receive_message');
        socket.off('messages_read');
      }
    };
  }, [conversation.id, token]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !token) return;

    if (isBlocked) {
      Alert.alert('Bilgi', 'Bu sohbet engellendi.');
      return;
    }

    try {
      const socket = getSocketAsync(token);
      if (socket) {
        socket.emit('send_message', {
          conversationId: conversation.id,
          content: newMessage.trim(),
        });
        setNewMessage('');
      } else {
        Alert.alert('Hata', 'Bağlantı hatası oluştu, mesaj gönderilemedi.');
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleBlockConversation = () => {
    Alert.alert(
      'Sohbeti Engelle',
      'Bu kullanıcıyı engellemek istediğinize emin misiniz? Artık birbirinize mesaj gönderemezsiniz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/chat/conversations/${conversation.id}/block`);
              setIsBlocked(true);
              Alert.alert('Başarılı', 'Sohbet engellendi.');
            } catch (error) {
              console.error('Failed to block conversation:', error);
              Alert.alert('Hata', 'Kullanıcı engellenemedi.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      'Sohbeti Sil',
      'Bu sohbeti tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/chat/conversations/${conversation.id}`);
              Alert.alert('Başarılı', 'Sohbet silindi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Failed to delete conversation:', error);
              Alert.alert('Hata', 'Sohbet silinemedi.');
            }
          },
        },
      ]
    );
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isSentByMe = item.senderId === user?.id;

    // Format time string
    let formattedTime = '';
    if (item.createdAt) {
      const date = new Date(item.createdAt);
      formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
      <View style={[styles.messageRow, isSentByMe ? styles.myMessageRow : styles.otherMessageRow]}>
        <View
          style={[
            styles.bubble,
            isSentByMe ? styles.myBubble : styles.otherBubble
          ]}
        >
          <Text style={styles.messageContentText}>{item.content}</Text>
          <View style={styles.messageMeta}>
            <Text style={styles.timeText}>{formattedTime}</Text>
            {isSentByMe && (
              item.isRead ? (
                <CheckCheck size={14} color="#000" style={styles.readIcon} />
              ) : (
                <Check size={14} color="rgba(0, 0, 0, 0.4)" style={styles.readIcon} />
              )
            )}
          </View>
        </View>
      </View>
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isBlocked ? (
          <View style={styles.blockedContainer}>
            <Text style={styles.blockedText}>Bu sohbet engellendi / Mesaj gönderilemez</Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Bir mesaj yaz..."
              value={newMessage}
              onChangeText={setNewMessage}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
              activeOpacity={0.7}
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Platform.OS === 'ios' ? 180 : 200,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  headerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerAvatarInitials: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.text,
  },
  headerTitleText: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    width: '100%',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  myBubble: {
    backgroundColor: '#86efac', // brutal green
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
    borderBottomLeftRadius: spacing.md,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#ffffff', // white
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
    borderBottomRightRadius: spacing.md,
    borderBottomLeftRadius: 2,
  },
  messageContentText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  readIcon: {
    marginLeft: 4,
  },
  blockedContainer: {
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedText: {
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    color: colors.brutalRed,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.sm,
    backgroundColor: colors.brutalBlue,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
