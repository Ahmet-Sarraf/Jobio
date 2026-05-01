import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
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

  @Get('my-applications')
  getMyApplications(@Req() req: any) {
    return this.jobsService.getMyApplications(req.user.id);
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

  @Post(':id/apply')
  applyJob(@Param('id') id: string, @Body() applyJobDto: ApplyJobDto, @Req() req: any) {
    return this.jobsService.applyJob(id, applyJobDto, req.user.id);
  }

  @Delete(':id/apply')
  cancelApplication(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.cancelApplication(id, req.user.id);
  }

  @Get(':id/application-status')
  checkApplicationStatus(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.checkApplicationStatus(id, req.user.id);
  }

  @Get(':id/applications')
  getJobApplications(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.getJobApplications(id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Patch('applications/:applicationId/status')
  updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body('status') status: 'ACCEPTED' | 'REJECTED',
    @Req() req: any,
  ) {
    return this.jobsService.updateApplicationStatus(applicationId, status, req.user.id);
  }
}

