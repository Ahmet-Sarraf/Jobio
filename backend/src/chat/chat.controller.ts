import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  async startConversation(@Request() req: any, @Body('freelancerId') freelancerId: string) {
    const user = req.user;
    if (user.role !== 'CUSTOMER') {
      throw new ForbiddenException('Only customers can start a conversation');
    }
    
    // We need customer profile id
    const customerProfile = await this.chatService['prisma'].customerProfile.findUnique({
      where: { userId: user.id }
    });

    if (!customerProfile) {
       throw new ForbiddenException('Customer profile not found');
    }

    return this.chatService.startConversation(customerProfile.id, freelancerId);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.id, req.user.role);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getMessages(id, req.user.id);
  }

  @Post('conversations/:id/block')
  async blockConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.blockConversation(id, req.user.id);
  }

  @Post('conversations/:id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.chatService.markAsRead(id, req.user.id);
    return { success: true };
  }

  @Delete('conversations/:id')
  async deleteConversation(@Request() req: any, @Param('id') id: string) {
    await this.chatService.deleteConversation(id, req.user.id);
    return { success: true };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.chatService.getUnreadMessageCount(req.user.id);
    return { count };
  }
}
