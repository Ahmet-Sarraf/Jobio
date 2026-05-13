import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SupabaseService } from '../supabase/supabase.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token?.split(' ')[1];
      if (!token) {
        console.error('Socket connection rejected: No token provided');
        socket.disconnect();
        return;
      }
      
      const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);
      
      if (error || !user) {
        throw new Error(`Supabase token verification failed: ${error?.message}`);
      }
      
      socket.data.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.user_role || 'FREELANCER'
      };
      
      // Join user's personal room for receiving notifications
      socket.join(`user_${user.id}`);
      console.log(`Socket connected for user: ${user.id}`);
    } catch (error) {
      console.error('Socket connection error (jwt verification failed):', error.message);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    if (socket.data.user) {
      console.log(`Socket disconnected for user: ${socket.data.user.id}`);
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(@ConnectedSocket() socket: Socket, @MessageBody() conversationId: string) {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.data.user?.id} joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(@ConnectedSocket() socket: Socket, @MessageBody() conversationId: string) {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.data.user?.id} left conversation: ${conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    console.log('Received send_message event:', payload);
    const user = socket.data.user;
    if (!user) {
      console.error('send_message failed: No user data in socket');
      return;
    }

    try {
      // Optimizasyon #1: saveMessage artık { message, otherUserId } döndürüyor.
      // İkinci findUnique sorgusu tamamen kaldırıldı.
      const { message, otherUserId } = await this.chatService.saveMessage(
        payload.conversationId,
        user.id,
        payload.content,
      );

      console.log('Message successfully saved to DB:', message.id);

      // Broadcast to the conversation room
      this.server.to(`conversation_${payload.conversationId}`).emit('receive_message', message);

      // Karşı tarafın personal room'una bildirim gönder
      this.server.to(`user_${otherUserId}`).emit('new_message_notification', message);
    } catch (error) {
      console.error('Error saving message:', error.message);
      socket.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('read_messages')
  async handleReadMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() conversationId: string,
  ) {
    const user = socket.data.user;
    if (!user) return;

    try {
      await this.chatService.markAsRead(conversationId, user.id);
      
      // Broadcast that messages were read in this conversation
      this.server.to(`conversation_${conversationId}`).emit('messages_read', { conversationId, readBy: user.id });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }
}
