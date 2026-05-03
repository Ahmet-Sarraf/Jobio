import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
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
      take: 50,
    });
  }

  async findById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        requiredSkills: true,
      },
    });
    if (!job) throw new NotFoundException('İlan bulunamadı.');
    return job;
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
        _count: { select: { applications: true } },
        // Kabul edilen başvuruyu da getir (müşteri "Aktif İşlerim" için)
        applications: {
          where: { status: 'ACCEPTED' },
          include: {
            freelancer: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getJobApplications(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });

    if (!job) throw new NotFoundException('İş bulunamadı.');
    if (job.customer.userId !== userId) {
      throw new ForbiddenException('Bu ilanın başvurularını görme yetkiniz yok.');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        freelancer: {
          include: {
            user: { select: { name: true, avatarUrl: true, email: true } },
          },
        },
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
      include: { 
        customer: true,
        freelancer: { include: { user: true } }
      },
    });

    if (!job) {
      throw new NotFoundException('İş bulunamadı.');
    }

    const isCustomer = job.customer.userId === userId;
    const isFreelancer = job.freelancer?.userId === userId;

    if (!isCustomer && !isFreelancer) {
      throw new ForbiddenException('Bu işi tamamlamak için yetkiniz yok.');
    }

    if (job.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Sadece IN_PROGRESS statüsündeki işler tamamlanabilir.');
    }

    await this.prisma.application.updateMany({
      where: { jobId, status: 'ACCEPTED' },
      data: { status: 'COMPLETED' },
    });

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' },
    });

    if (isFreelancer && job.freelancer?.user) {
      const freelancerName = job.freelancer.user.name || 'Freelancer';
      await this.prisma.notification.create({
        data: {
          userId: job.customer.userId,
          message: `${freelancerName}, ${job.title} isimli işi tamamladı. Kontrol edip değerlendirmek için tıklayın.`,
        }
      });
    }

    return updatedJob;
  }

  async applyJob(jobId: string, applyJobDto: ApplyJobDto, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş bulunamadı.');
    
    if (job.status !== 'OPEN') {
      throw new BadRequestException('Bu iş başvurulara kapalıdır.');
    }

    const freelancer = await this.prisma.freelancerProfile.findUnique({ where: { userId } });
    if (!freelancer) {
      throw new ForbiddenException('Sadece freelancer profili olanlar başvuru yapabilir.');
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        jobId_freelancerId: {
          jobId,
          freelancerId: freelancer.id,
        }
      }
    });

    if (existingApplication) {
      throw new BadRequestException('Bu işe zaten başvurdunuz.');
    }

    return this.prisma.application.create({
      data: {
        jobId,
        freelancerId: freelancer.id,
        coverLetter: applyJobDto.coverLetter,
      }
    });
  }

  async cancelApplication(jobId: string, userId: string) {
    const freelancer = await this.prisma.freelancerProfile.findUnique({ where: { userId } });
    if (!freelancer) {
      throw new ForbiddenException('Freelancer profili bulunamadı.');
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        jobId_freelancerId: {
          jobId,
          freelancerId: freelancer.id,
        }
      }
    });

    if (!existingApplication) {
      throw new NotFoundException('Bu işe ait başvuru bulunamadı.');
    }

    return this.prisma.application.delete({
      where: { id: existingApplication.id }
    });
  }

  async checkApplicationStatus(jobId: string, userId: string) {
    const freelancer = await this.prisma.freelancerProfile.findUnique({ where: { userId } });
    if (!freelancer) {
      return { hasApplied: false, status: null };
    }

    const application = await this.prisma.application.findUnique({
      where: {
        jobId_freelancerId: {
          jobId,
          freelancerId: freelancer.id,
        }
      }
    });

    return { hasApplied: !!application, status: application?.status ?? null };
  }

  async updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED', userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            customer: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        freelancer: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!application) throw new NotFoundException('Başvuru bulunamadı.');
    if (application.job.customer.userId !== userId) {
      throw new ForbiddenException('Bu başvuruyu değerlendirme yetkiniz yok.');
    }

    // Aynı iş için zaten kabul edilmiş biri var mı?
    if (status === 'ACCEPTED') {
      const alreadyAccepted = await this.prisma.application.findFirst({
        where: { jobId: application.jobId, status: 'ACCEPTED' },
      });
      if (alreadyAccepted) {
        throw new BadRequestException('Bu ilan için zaten bir aday kabul edilmiştir.');
      }
    }

    // Statüyü güncelle
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Eğer KABUL EDİLDİYSE: ilanı da IN_PROGRESS yap ve freelancer'ı ata
    if (status === 'ACCEPTED') {
      await this.prisma.job.update({
        where: { id: application.jobId },
        data: {
          status: 'IN_PROGRESS',
          freelancerId: application.freelancerId,
        },
      });
    }

    const employerName = application.job.customer.user.name || 'Bir işveren';
    const jobTitle = application.job.title;
    const statusText = status === 'ACCEPTED' ? 'Kabul Edildi' : 'Reddedildi';
    const message = `${employerName} isimli kullanıcının açtığı ${jobTitle} ilanına başvurunuz ${statusText}. İyi çalışmalar.`;

    // Kabul edilen freelancer'a bildirim
    await this.prisma.notification.create({
      data: { userId: application.freelancer.user.id, message },
    });

    // Eğer KABUL EDİLDİYSE: diğer PENDING başvuruları otomatik reddet ve bildir
    if (status === 'ACCEPTED') {
      const otherApps = await this.prisma.application.findMany({
        where: {
          jobId: application.jobId,
          id: { not: applicationId },
          status: 'PENDING',
        },
        include: {
          freelancer: {
            include: { user: { select: { id: true } } },
          },
        },
      });

      if (otherApps.length > 0) {
        // Hepsini REJECTED yap
        await this.prisma.application.updateMany({
          where: {
            jobId: application.jobId,
            id: { not: applicationId },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        });

        // Her birine red bildirimi gönder
        const rejectMsg = `${employerName} isimli kullanıcının açtığı ${jobTitle} ilanına başvurunuz Reddedildi. İyi çalışmalar.`;
        await this.prisma.notification.createMany({
          data: otherApps.map((app) => ({
            userId: app.freelancer.user.id,
            message: rejectMsg,
          })),
        });
      }
    }

    return updated;
  }

  async getMyApplications(userId: string) {
    const freelancer = await this.prisma.freelancerProfile.findUnique({ where: { userId } });
    if (!freelancer) {
      throw new ForbiddenException('Freelancer profili bulunamadı.');
    }

    return this.prisma.application.findMany({
      where: { freelancerId: freelancer.id },
      include: {
        job: {
          include: {
            customer: {
              include: {
                user: { select: { name: true, avatarUrl: true } },
              },
            },
            requiredSkills: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
