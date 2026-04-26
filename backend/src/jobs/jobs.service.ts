import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, userId: string) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new ForbiddenException('Sadece müşteri (customer) profili olanlar iş ilanı oluşturabilir.');
    }

    const jobData: any = {
      title: createJobDto.title,
      description: createJobDto.description,
      category: createJobDto.category,
      experienceLevel: createJobDto.experienceLevel,
      duration: createJobDto.duration,
      budget: createJobDto.budget,
      customerId: customer.id,
      status: 'OPEN',
    };

    if (createJobDto.skills && createJobDto.skills.length > 0) {
      jobData.requiredSkills = {
        connectOrCreate: createJobDto.skills.map((skill) => ({
          where: { name: skill.toLowerCase().trim() },
          create: { name: skill.toLowerCase().trim() },
        })),
      };
    }

    return this.prisma.job.create({
      data: jobData,
    });
  }

  async findAllOpenJobs() {
    return this.prisma.job.findMany({
      where: { status: 'OPEN' },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
        requiredSkills: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyJobs(userId: string) {
    const customer = await this.prisma.customerProfile.findUnique({ where: { userId }});
    const freelancer = await this.prisma.freelancerProfile.findUnique({ where: { userId }});

    const OR = [];
    if (customer) OR.push({ customerId: customer.id });
    if (freelancer) OR.push({ freelancerId: freelancer.id });

    if (OR.length === 0) {
      return [];
    }

    return this.prisma.job.findMany({
      where: { OR },
      include: {
        customer: { include: { user: { select: { name: true, avatarUrl: true } } } },
        freelancer: { include: { user: { select: { name: true, avatarUrl: true } } } },
        requiredSkills: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignJob(jobId: string, assignJobDto: AssignJobDto, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });

    if (!job) {
      throw new NotFoundException('İş bulunamadı.');
    }

    if (job.customer.userId !== userId) {
      throw new ForbiddenException('Sadece kendi açtığınız işe birini atayabilirsiniz.');
    }

    if (job.status !== 'OPEN') {
      throw new BadRequestException('Sadece AÇIK (OPEN) statüsündeki işlere atama yapılabilir.');
    }

    const freelancer = await this.prisma.freelancerProfile.findUnique({
      where: { id: assignJobDto.freelancerId },
    });

    if (!freelancer) {
      throw new NotFoundException('Belirtilen freelancer bulunamadı.');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        freelancerId: freelancer.id,
        status: 'IN_PROGRESS',
      },
    });
  }

  async completeJob(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });

    if (!job) {
      throw new NotFoundException('İş bulunamadı.');
    }

    if (job.customer.userId !== userId) {
      throw new ForbiddenException('Sadece kendi açtığınız işi tamamlayabilirsiniz.');
    }

    if (job.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Sadece IN_PROGRESS statüsündeki işler tamamlanabilir.');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' },
    });
  }
}
