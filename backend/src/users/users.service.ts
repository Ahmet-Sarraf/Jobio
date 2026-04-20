import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        freelancerProfile: true,
        customerProfile: true,
      },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      // CV, FreelancerProfile'dan okunur
      cvUrl: user.freelancerProfile?.resumeUrl ?? null,
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    // User tablosunu güncelle (avatar, name)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      include: { freelancerProfile: true },
    });

    // FreelancerProfile varsa ve cvUrl gönderildiyse resumeUrl güncelle
    if (dto.cvUrl !== undefined && updatedUser.freelancerProfile) {
      await this.prisma.freelancerProfile.update({
        where: { userId },
        data: { resumeUrl: dto.cvUrl },
      });
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      cvUrl: updatedUser.freelancerProfile?.resumeUrl ?? null,
    };
  }
}
