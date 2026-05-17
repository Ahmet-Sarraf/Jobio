import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('match-freelancers/:jobId')
  matchFreelancers(@Param('jobId') jobId: string) {
    return this.aiService.matchFreelancersForJob(jobId);
  }

  @Get('match-jobs')
  matchJobs(@Req() req: any) {
    return this.aiService.matchJobsForFreelancer(req.user.id);
  }
}
