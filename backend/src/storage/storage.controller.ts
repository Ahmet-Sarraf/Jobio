import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Dosya bulunamadı');

    const publicUrl = await this.storageService.uploadFile(req.user.id, 'avatars', file);

    // Update user profile in DB
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: publicUrl },
    });

    return { message: 'Avatar yüklendi', url: publicUrl };
  }

  @Post('portfolio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPortfolio(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Dosya bulunamadı');
    if (req.user.role !== Role.FREELANCER) {
      throw new BadRequestException('Yalnızca freelancerlar portfolyo yükleyebilir');
    }

    const publicUrl = await this.storageService.uploadFile(req.user.id, 'freelancer-portfolios', file);

    // Update freelancer profile
    await this.prisma.freelancerProfile.update({
      where: { userId: req.user.id },
      data: { resumeUrl: publicUrl },
    });

    return { message: 'Portfolyo yükledi', url: publicUrl };
  }
}
