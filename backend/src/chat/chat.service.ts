import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async startConversation(customerId: string, freelancerId: string) {
    return this.prisma.conversation.upsert({
      where: {
        customerId_freelancerId: {
          customerId,
          freelancerId,
        },
      },
      update: {},
      create: {
        customerId,
        freelancerId,
      },
      include: {
        customer: { include: { user: true } },
        freelancer: { include: { user: true } },
      }
    });
  }

  async getConversations(userId: string, role: 'CUSTOMER' | 'FREELANCER') {
    // Optimizasyon #3: 2 round-trip yerine tek sorguda join ile çek
    if (role === 'CUSTOMER') {
      return this.prisma.conversation.findMany({
        where: { customer: { userId } },
        include: {
          freelancer: { include: { user: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      return this.prisma.conversation.findMany({
        where: { freelancer: { userId } },
        include: {
          customer: { include: { user: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true, freelancer: true }
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    // Verify user is part of the conversation
    if (conversation.customer.userId !== userId && conversation.freelancer.userId !== userId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async saveMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<{ message: any; otherUserId: string }> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true, freelancer: true },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    if (conversation.isBlocked) {
      throw new ForbiddenException('This conversation is blocked');
    }

    // Verify sender
    if (conversation.customer.userId !== senderId && conversation.freelancer.userId !== senderId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    // Optimizasyon #1: message create ve conversation updatedAt güncellemesini paralel çalıştır
    const [message] = await Promise.all([
      this.prisma.message.create({
        data: { conversationId, senderId, content },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Karşı tarafın userId'sini hesapla — gateway'de ikinci sorguya gerek kalmaz
    const otherUserId =
      conversation.customer.userId === senderId
        ? conversation.freelancer.userId
        : conversation.customer.userId;

    return { message, otherUserId };
  }

  // Optimizasyon #1 (gateway): private prisma erişimi yerine public metot
  async getConversationWithParticipants(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true, freelancer: true },
    });
  }

  async blockConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { freelancer: true, customer: true }
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    if (conversation.freelancer.userId !== userId && conversation.customer.userId !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isBlocked: true,
        blockedById: userId,
      }
    });
  }

  async markAsRead(conversationId: string, userId: string) {
    // Mark all messages in this conversation where senderId is NOT the current user as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true, freelancer: true }
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    // Verify user is part of the conversation
    if (conversation.customer.userId !== userId && conversation.freelancer.userId !== userId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    return this.prisma.conversation.delete({
      where: { id: conversationId }
    });
  }

  async getUnreadMessageCount(userId: string) {
    return this.prisma.message.count({
      where: {
        conversation: {
          OR: [
            { customer: { userId } },
            { freelancer: { userId } },
          ],
        },
        senderId: { not: userId },
        isRead: false,
      },
    });
  }
}
