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
      // CV ve Freelancer verileri FreelancerProfile'dan okunur
      cvUrl: user.freelancerProfile?.resumeUrl ?? null,
      company: user.customerProfile?.company ?? null,
      bio: user.freelancerProfile?.bio ?? null,
      hourlyRate: user.freelancerProfile?.hourlyRate ?? null,
      portfolioUrl: user.freelancerProfile?.portfolioUrl ?? null,
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true, customerProfile: true },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    // User tablosunu güncelle (avatar, name)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      include: { freelancerProfile: true, customerProfile: true },
    });

    // FreelancerProfile varsa gönderilen alanları güncelle
    if (updatedUser.freelancerProfile) {
      const freelancerData: any = {};
      if (dto.cvUrl !== undefined) freelancerData.resumeUrl = dto.cvUrl;
      if (dto.bio !== undefined) freelancerData.bio = dto.bio;
      if (dto.hourlyRate !== undefined) freelancerData.hourlyRate = dto.hourlyRate;
      if (dto.portfolioUrl !== undefined) freelancerData.portfolioUrl = dto.portfolioUrl;

      if (Object.keys(freelancerData).length > 0) {
        await this.prisma.freelancerProfile.update({
          where: { userId },
          data: freelancerData,
        });
        
        if (freelancerData.resumeUrl !== undefined) updatedUser.freelancerProfile.resumeUrl = freelancerData.resumeUrl;
        if (freelancerData.bio !== undefined) updatedUser.freelancerProfile.bio = freelancerData.bio;
        if (freelancerData.hourlyRate !== undefined) updatedUser.freelancerProfile.hourlyRate = freelancerData.hourlyRate;
        if (freelancerData.portfolioUrl !== undefined) updatedUser.freelancerProfile.portfolioUrl = freelancerData.portfolioUrl;
      }
    }

    // CustomerProfile varsa ve company gönderildiyse güncelle
    if (dto.company !== undefined && updatedUser.customerProfile) {
      await this.prisma.customerProfile.update({
        where: { userId },
        data: { company: dto.company },
      });
      updatedUser.customerProfile.company = dto.company;
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      cvUrl: updatedUser.freelancerProfile?.resumeUrl ?? null,
      company: updatedUser.customerProfile?.company ?? null,
      bio: updatedUser.freelancerProfile?.bio ?? null,
      hourlyRate: updatedUser.freelancerProfile?.hourlyRate ?? null,
      portfolioUrl: updatedUser.freelancerProfile?.portfolioUrl ?? null,
    };
  }
}
