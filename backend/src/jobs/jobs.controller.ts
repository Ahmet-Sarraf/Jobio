import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  create(@Body() createJobDto: CreateJobDto, @Req() req: any) {
    return this.jobsService.create(createJobDto, req.user.id);
  }

  @Get()
  findAll() {
    console.log("SECRET IN CONTROLLER:", process.env.SUPABASE_JWT_SECRET);
    return this.jobsService.findAllOpenJobs();
  }

  @Get('my-jobs')
  findMyJobs(@Req() req: any) {
    return this.jobsService.findMyJobs(req.user.id);
  }

  @Patch(':id/assign')
  assignJob(
    @Param('id') id: string,
    @Body() assignJobDto: AssignJobDto,
    @Req() req: any,
  ) {
    return this.jobsService.assignJob(id, assignJobDto, req.user.id);
  }

  @Patch(':id/complete')
  completeJob(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.completeJob(id, req.user.id);
  }
}
