import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) { }

  // Şifreyi her istek atıldığında anlık olarak okuyan güvenli yardımcı fonksiyon
  private getGenAIModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is missing. Please add it to backend/.env file.');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // En stabil ve hızlı sürüm
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  async matchFreelancersForJob(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { requiredSkills: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const jobSkillIds = job.requiredSkills.map(s => s.id);

    // Bütün freelancerları çekmek yerine yeteneklere göre filtrele ve sınırlandır
    const freelancers = await this.prisma.freelancerProfile.findMany({
      where: {
        user: { role: 'FREELANCER' },
        ...(jobSkillIds.length > 0 ? {
          skills: {
            some: {
              id: { in: jobSkillIds }
            }
          }
        } : {})
      },
      include: { skills: true, user: true },
      take: 20, // Sadece en uygun/ilk 20 adayı Gemini'ye gönder
    });

    if (freelancers.length === 0) {
      return [];
    }

    const jobDetails = `
Title: ${job.title}
Category: ${job.category || 'N/A'}
Experience Level: ${job.experienceLevel || 'N/A'}
Description: ${job.description}
Required Skills: ${job.requiredSkills.map((s) => s.name).join(', ')}
`;

    const freelancersData = freelancers.map(
      (f) => `
ID: ${f.id}
Name: ${f.user?.name || 'Unknown'}
Bio: ${f.bio || 'None'}
Skills: ${f.skills.map((s) => s.name).join(', ')}
`
    ).join('\n---\n');

    const prompt = `You are an expert HR and recruitment AI.
I have a job listing and a list of freelancers. I want you to calculate a match score (0-100) for each freelancer based on how well their skills and bio match the job's requirements.

Job Details:
${jobDetails}

Freelancers:
${freelancersData}

Respond EXACTLY with a JSON array in the following format, nothing else. Do not use markdown backticks (e.g. \`\`\`json) or any extra text, just the raw JSON:
[
  {
    "freelancerId": "the ID of the freelancer",
    "name": "the Name of the freelancer",
    "matchScore": 95,
    "reason": "Short explanation in Turkish why they are a good match"
  }
]
Sort the array descending by matchScore. Only return the top 10 matches if there are many.`;

    try {
      const model = this.getGenAIModel();
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error: any) {
      console.error('Gemini AI error (matchFreelancersForJob):', error);
      throw new InternalServerErrorException(`Yapay zeka hatası: ${error?.message || 'Bilinmeyen hata'}`);
    }
  }

  async matchJobsForFreelancer(userId: string) {
    const freelancer = await this.prisma.freelancerProfile.findUnique({
      where: { userId },
      include: { skills: true, user: true },
    });

    if (!freelancer) {
      throw new NotFoundException('Freelancer profile not found');
    }

    const freelancerSkillIds = freelancer.skills.map(s => s.id);

    // Bütün işleri çekmek yerine yeteneklere göre filtrele ve sınırlandır
    const openJobs = await this.prisma.job.findMany({
      where: {
        status: 'OPEN',
        ...(freelancerSkillIds.length > 0 ? {
          requiredSkills: {
            some: {
              id: { in: freelancerSkillIds }
            }
          }
        } : {})
      },
      include: { requiredSkills: true },
      orderBy: { createdAt: 'desc' },
      take: 20, // Sadece en yeni 20 işi Gemini'ye gönder
    });

    if (openJobs.length === 0) {
      return [];
    }

    const freelancerDetails = `
Name: ${freelancer.user?.name || 'Unknown'}
Bio: ${freelancer.bio || 'None'}
Skills: ${freelancer.skills.map((s) => s.name).join(', ')}
`;

    const jobsData = openJobs.map(
      (j) => `
ID: ${j.id}
Title: ${j.title}
Category: ${j.category || 'N/A'}
Experience Level: ${j.experienceLevel || 'N/A'}
Description: ${j.description}
Required Skills: ${j.requiredSkills.map((s) => s.name).join(', ')}
`
    ).join('\n---\n');

    const prompt = `You are an expert HR and recruitment AI.
I have a freelancer profile and a list of open jobs. I want you to calculate a match score (0-100) for each job based on how well the job's requirements match the freelancer's skills and bio.

Freelancer Details:
${freelancerDetails}

Open Jobs:
${jobsData}

Respond EXACTLY with a JSON array in the following format, nothing else. Do not use markdown backticks (e.g. \`\`\`json) or any extra text, just the raw JSON:
[
  {
    "jobId": "the ID of the job",
    "title": "the Title of the job",
    "matchScore": 95,
    "reason": "Short explanation in Turkish why this job is a good match"
  }
]
Sort the array descending by matchScore. Only return the top 10 matches if there are many.`;

    try {
      const model = this.getGenAIModel();
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error: any) {
      console.error('Gemini AI error (matchJobsForFreelancer):', error);
      throw new InternalServerErrorException(`Yapay zeka hatası: ${error?.message || 'Bilinmeyen hata'}`);
    }
  }

  async evaluateApplicationSuitability(applicationId: string) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: { include: { requiredSkills: true } },
          freelancer: { include: { skills: true, user: true } },
        },
      });

      if (!application) return;

      const job = application.job;
      const freelancer = application.freelancer;

      const jobDetails = `
Title: ${job.title}
Category: ${job.category || 'N/A'}
Experience Level: ${job.experienceLevel || 'N/A'}
Description: ${job.description}
Required Skills: ${job.requiredSkills.map((s) => s.name).join(', ')}
`;

      const freelancerDetails = `
Name: ${freelancer.user?.name || 'Unknown'}
Bio: ${freelancer.bio || 'None'}
Cover Letter: ${application.coverLetter || 'None'}
Skills: ${freelancer.skills.map((s) => s.name).join(', ')}
`;

      const prompt = `You are an expert HR and recruitment AI.
I have a job listing and a freelancer who just applied for this job.
I want you to evaluate how suitable this freelancer is for this job based on their skills, bio, and cover letter.

Job Details:
${jobDetails}

Applicant Details:
${freelancerDetails}

Respond EXACTLY with a JSON object in the following format, nothing else. Do not use markdown backticks (e.g. \`\`\`json) or any extra text, just the raw JSON:
{
  "matchScore": 95,
  "reason": "Short explanation in Turkish why they are suitable or not"
}`;

      const model = this.getGenAIModel();
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Temizleme: Eğer API markdown formatında dönerse temizle
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const evaluation = JSON.parse(responseText);

      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          aiScore: evaluation.matchScore,
          aiReasoning: evaluation.reason,
        },
      });
    } catch (error) {
      console.error('Gemini AI error (evaluateApplicationSuitability):', error);
    }
  }
}