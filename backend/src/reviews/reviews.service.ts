import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: createReviewDto.jobId },
      include: { customer: true },
    });

    if (!job) {
      throw new NotFoundException('İş bulunamadı.');
    }

    if (job.status !== 'COMPLETED') {
      throw new BadRequestException('Sadece tamamlanmış (COMPLETED) işlere puan verebilirsiniz.');
    }

    if (job.customer.userId !== userId) {
      throw new ForbiddenException('Sadece kendi açtığınız iş için yorum yapabilirsiniz.');
    }

    if (!job.freelancerId) {
      throw new BadRequestException('Bu işe atanmış bir freelancer bulunmuyor.');
    }

    // Yorumun daha önceden yapılıp yapılmadığını kontrol et
    const existingReview = await this.prisma.review.findUnique({
      where: { jobId: job.id },
    });

    if (existingReview) {
      throw new BadRequestException('Bu iş için zaten bir değerlendirme yaptınız.');
    }

    return this.prisma.review.create({
      data: {
        score: createReviewDto.score,
        comment: createReviewDto.comment,
        jobId: job.id,
        reviewerId: job.customer.id,
        revieweeId: job.freelancerId,
      },
    });
  }

  async findByFreelancer(freelancerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { revieweeId: freelancerId },
      include: {
        reviewer: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
        job: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const aggregate = await this.prisma.review.aggregate({
      where: { revieweeId: freelancerId },
      _avg: { score: true },
      _count: { score: true },
    });

    return {
      averageScore: aggregate._avg.score || 0,
      totalReviews: aggregate._count.score,
      reviews,
    };
  }
}
